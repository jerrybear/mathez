import React, { useEffect, useMemo, useRef, useState } from 'react';

const toSeedNumber = (raw) => {
  const source = String(raw ?? '');
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash >>>= 0;
    hash *= 16777619;
    hash >>>= 0;
  }
  return hash >>> 0;
};

const deterministicRange = (seed, min, max) => {
  const span = max - min;
  return (toSeedNumber(seed) % (span + 1)) + min;
};

const clampPositiveInteger = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? Math.max(fallback, Math.round(next)) : fallback;
};

const parseSeed = (visual) => String(visual?.seed || visual?.seedValue || '0');

const SplitItem = ({
  id,
  visual,
  position,
  seed,
  onTapItem,
  onDragStart,
  onPointerDownItem,
  className = ''
}) => {
  const jitterX = deterministicRange(`${seed}-${id}-x`, -18, 18);
  const jitterY = deterministicRange(`${seed}-${id}-y`, -10, 10);

  return (
    <button
      type="button"
      className={`split-item ${position === 'plate-a' ? 'plate-a' : position === 'plate-b' ? 'plate-b' : ''} ${className}`.trim()}
      style={{ '--jitter-x': `${jitterX}px`, '--jitter-y': `${jitterY}px` }}
      draggable
      onDragStart={(event) => onDragStart(id, event)}
      onPointerDown={(event) => onPointerDownItem(id, event)}
      onClick={() => onTapItem(id)}
      aria-label={`${visual?.target || '항목'} 이동`}
    >
      {visual?.target || '🍎'}
    </button>
  );
};

export const ManipulativeSplitCombine = ({ visual = {}, seed = '' }) => {
  const safeSeed = `${parseSeed(visual)}-${seed}`;
  const totalCount = clampPositiveInteger(visual?.totalCount, 1);
  const [items, setItems] = useState(() => {
    return Array.from({ length: totalCount }, (_, index) => ({
      id: `item-${index + 1}`,
      position: 'source'
    }));
  });

  const [dragItem, setDragItem] = useState(null);
  const [bouncedId, setBouncedId] = useState('');
  const sourceZoneRef = useRef(null);
  const plateAZoneRef = useRef(null);
  const plateBZoneRef = useRef(null);
  const touchDragRef = useRef({
    active: false,
    itemId: '',
    pointerId: null,
    startX: 0,
    startY: 0,
    moved: false,
    listeners: null
  });
  const clickBlockRef = useRef({ itemId: '', until: 0 });

  const setClickBlock = (itemId) => {
    clickBlockRef.current = { itemId, until: performance.now() + 260 };
  };

  useEffect(() => {
    setItems(Array.from({ length: totalCount }, (_, index) => ({
      id: `item-${index + 1}`,
      position: 'source'
    })));
  }, [totalCount, safeSeed]);

  useEffect(() => () => {
    const listenerState = touchDragRef.current.listeners;
    if (listenerState) {
      window.removeEventListener('pointermove', listenerState.onMove);
      window.removeEventListener('pointerup', listenerState.onEnd);
      window.removeEventListener('pointercancel', listenerState.onEnd);
      touchDragRef.current.listeners = null;
    }
  }, []);

  const sourceCount = items.filter((item) => item.position === 'source').length;
  const plateA = items.filter((item) => item.position === 'plate-a').length;
  const plateB = items.filter((item) => item.position === 'plate-b').length;

  const moveTo = (itemId, position) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      return { ...item, position };
    }));

    setBouncedId(itemId);
    window.clearTimeout(window.__splitCombineBounceTimer);
    window.__splitCombineBounceTimer = window.setTimeout(() => {
      setBouncedId('');
    }, 220);
  };

  const handleDragStart = (itemId, event) => {
    setDragItem(itemId);
    event.dataTransfer.setData('text/plain', itemId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (position) => (event) => {
    event.preventDefault();
    const nextId = event.dataTransfer.getData('text/plain') || dragItem;
    if (!nextId) return;
    moveTo(nextId, position);
    setDragItem(null);
  };

  const toggleItem = (itemId) => {
    if (clickBlockRef.current.itemId === itemId && clickBlockRef.current.until > performance.now()) {
      return;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;

    if (item.position === 'source') moveTo(itemId, 'plate-a');
    else if (item.position === 'plate-a') moveTo(itemId, 'plate-b');
    else moveTo(itemId, 'source');
  };

  const resolveZoneAt = (clientX, clientY) => {
    const pointZones = [
      ['source', sourceZoneRef.current],
      ['plate-a', plateAZoneRef.current],
      ['plate-b', plateBZoneRef.current]
    ];
    const found = pointZones.find(([, zoneRef]) => {
      if (!zoneRef) return false;
      const rect = zoneRef.getBoundingClientRect();
      return (
        clientX >= rect.left
        && clientX <= rect.right
        && clientY >= rect.top
        && clientY <= rect.bottom
      );
    });
    return found ? found[0] : null;
  };

  const handleTouchPointerDown = (itemId, event) => {
    const { pointerType, pointerId, clientX, clientY } = event;
    if (pointerType !== 'touch' && pointerType !== 'pen') return;

    event.preventDefault();
    touchDragRef.current = {
      active: true,
      itemId,
      pointerId,
      startX: clientX,
      startY: clientY,
      moved: false
    };

    const finalizeTouchDrag = (pointerEvent) => {
      if (
        !touchDragRef.current.active
        || pointerEvent.pointerId !== touchDragRef.current.pointerId
      ) {
        return;
      }

      const moved = touchDragRef.current.moved;
      const endItemId = touchDragRef.current.itemId;

      if (moved) {
        const zone = resolveZoneAt(pointerEvent.clientX, pointerEvent.clientY);
        if (zone) {
          moveTo(endItemId, zone);
          setClickBlock(endItemId);
        }
      }

      touchDragRef.current = {
        ...touchDragRef.current,
        active: false,
        moved: moved
      };
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      touchDragRef.current.listeners = null;
    };

    const onMove = (pointerEvent) => {
      if (
        !touchDragRef.current.active
        || pointerEvent.pointerId !== touchDragRef.current.pointerId
      ) return;

      const { startX, startY } = touchDragRef.current;
      const dx = pointerEvent.clientX - startX;
      const dy = pointerEvent.clientY - startY;
      if (!touchDragRef.current.moved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        touchDragRef.current.moved = true;
      }

      if (touchDragRef.current.moved) {
        pointerEvent.preventDefault();
      }
    };

    const onEnd = (pointerEvent) => {
      finalizeTouchDrag(pointerEvent);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      touchDragRef.current.listeners = null;
    };

    touchDragRef.current.listeners = {
      onMove,
      onEnd
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd, { passive: false });
    window.addEventListener('pointercancel', onEnd, { passive: false });
  };

  const sourceItems = useMemo(
    () => items.filter((item) => item.position === 'source'),
    [items]
  );
  const plateAItems = useMemo(
    () => items.filter((item) => item.position === 'plate-a'),
    [items]
  );
  const plateBItems = useMemo(
    () => items.filter((item) => item.position === 'plate-b'),
    [items]
  );

  return (
    <div className="manipulative-card">
      <p className="visual-caption">{visual.prompt || '가르기/모으기 조작 연습'}</p>
      <div className="manipulative-subtitle">🍎 과일을 드래그해 접시에 옮겨 보거나, 과일을 탭해 이동해보세요.</div>

      <div className="split-zone split-source">
        <p className="split-zone-label">전체 ({sourceCount})</p>
        <div
          ref={sourceZoneRef}
          className="split-zone-area split-source-area"
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop('source')(event)}
        >
          {sourceItems.map((item) => (
            <SplitItem
              key={item.id}
              id={item.id}
              visual={visual}
              position={item.position}
              seed={safeSeed}
              onPointerDownItem={handleTouchPointerDown}
              onDragStart={handleDragStart}
              onTapItem={toggleItem}
              className={bouncedId === item.id ? 'bounce' : ''}
            />
          ))}
        </div>
      </div>

      <div className="split-zone-row">
        <div
          ref={plateAZoneRef}
          className="split-zone split-target"
          onDragOver={handleDragOver}
          onDrop={handleDrop('plate-a')}
        >
          <p className="split-zone-label">접시 A ({plateA})</p>
          <div className="split-zone-area">
            {plateAItems.map((item) => (
              <SplitItem
                key={item.id}
              id={item.id}
              visual={visual}
              position={item.position}
              seed={safeSeed}
              onPointerDownItem={handleTouchPointerDown}
              onDragStart={handleDragStart}
              onTapItem={toggleItem}
              className={bouncedId === item.id ? 'bounce' : ''}
            />
          ))}
          </div>
        </div>

        <div
          ref={plateBZoneRef}
          className="split-zone split-target"
          onDragOver={handleDragOver}
          onDrop={handleDrop('plate-b')}
        >
          <p className="split-zone-label">접시 B ({plateB})</p>
          <div className="split-zone-area">
            {plateBItems.map((item) => {
              return (
                <SplitItem
                  key={item.id}
                id={item.id}
                visual={visual}
                position={item.position}
                seed={safeSeed}
                onPointerDownItem={handleTouchPointerDown}
                onDragStart={handleDragStart}
                onTapItem={toggleItem}
                className={bouncedId === item.id ? 'bounce' : ''}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ManipulativeBase10 = ({ visual = {}, seed = '' }) => {
  const safeSeed = `${parseSeed(visual)}-${seed}`;
  const initialTens = clampPositiveInteger(visual?.tensCount, 1);
  const initialOnes = clampPositiveInteger(visual?.onesCount, 0);
  const [tensCount, setTensCount] = useState(initialTens);
  const [onesCount, setOnesCount] = useState(initialOnes);
  const [burstIndex, setBurstIndex] = useState(-1);
  const [burstParticles, setBurstParticles] = useState([]);
  const burstIdRef = useRef(0);

  useEffect(() => {
    setTensCount(initialTens);
    setOnesCount(initialOnes);
    setBurstIndex(-1);
    setBurstParticles([]);
  }, [initialTens, initialOnes, safeSeed]);

  const totalPieces = Math.min(40, onesCount);
  const tens = useMemo(
    () => Array.from({ length: Math.max(tensCount, 0) }, (_, index) => index),
    [tensCount]
  );
  const ones = useMemo(
    () => Array.from({ length: totalPieces }, (_, index) => index),
    [onesCount]
  );

  const splitTens = (index) => {
    if (tensCount <= 0) return;
    setTensCount((prev) => Math.max(0, prev - 1));
    setOnesCount((prev) => prev + 10);
    setBurstIndex(index);
    burstIdRef.current += 1;
    const burstId = burstIdRef.current;
    const particles = Array.from({ length: 8 }, (_, particleIndex) => ({
      id: `p-${index}-${burstId}-${particleIndex}`,
      angle: deterministicRange(`${safeSeed}-${burstId}-${index}-${particleIndex}-angle`, 0, 360),
      size: deterministicRange(`${safeSeed}-${burstId}-${index}-${particleIndex}-size`, 5, 9),
      hue: deterministicRange(`${safeSeed}-${burstId}-${index}-${particleIndex}-hue`, 8, 32),
      delay: deterministicRange(`${safeSeed}-${burstId}-${index}-${particleIndex}-delay`, 0, 90)
    }));
    particles.forEach((particle) => {
      const rad = (particle.angle * Math.PI) / 180;
      const distance = deterministicRange(
        `${safeSeed}-${burstId}-${particle.id}-distance`,
        14,
        34
      );
      particle.dx = `${Math.cos(rad) * distance}px`;
      particle.dy = `${Math.sin(rad) * distance}px`;
    });

    setBurstParticles((prev) => [...prev, ...particles]);
    const particleIds = new Set(particles.map((entry) => entry.id));
    window.clearTimeout(window.__base10ParticleTimer);
    window.__base10ParticleTimer = window.setTimeout(() => {
      setBurstParticles((prev) => prev.filter((entry) => !particleIds.has(entry.id)));
    }, 1300);
    window.clearTimeout(window.__base10BurstTimer);
    window.__base10BurstTimer = window.setTimeout(() => setBurstIndex(-1), 380);
  };

  const mergeUnitsToTens = () => {
    if (onesCount < 10) return;
    setOnesCount((prev) => prev - 10);
    setTensCount((prev) => prev + 1);
  };

  return (
    <div className="manipulative-card">
      <p className="visual-caption">{visual.prompt || '받아오기/빌려오기 연습'}</p>
      <p className="visual-subtitle">십의 자리 막대를 누르면 일의 자리로 쪼개집니다.</p>

      <div className="base10-row">
        <div className="base10-label">
          십 모형
          <button
            type="button"
            className="glass-btn accent-bg"
            onClick={mergeUnitsToTens}
            disabled={onesCount < 10}
            style={{ marginLeft: '0.5rem', padding: '0.35rem 0.7rem' }}
          >
            10개 모으기
          </button>
        </div>
        <div className="base10-tens-wrap">
          <div className="base10-tens" style={{ '--seed': safeSeed }}>
            {tens.map((index) => (
              <button
                key={`t-${index}`}
                type="button"
                className={`base10-tens-item ${burstIndex === index ? 'burst' : ''}`}
                onClick={() => splitTens(index)}
                aria-label={`${index + 1}번째 십 모형 분해`}
              >
                ━━━━
              </button>
            ))}
          </div>

          <div className="base10-burst-layer" aria-hidden="true">
            {burstParticles.map((particle) => (
              <span
                key={particle.id}
                className="base10-particle"
                style={{
                  '--dx': particle.dx,
                  '--dy': particle.dy,
                  '--size': `${particle.size}px`,
                  '--hue': `${particle.hue}`,
                  '--delay': `${particle.delay}ms`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="base10-row">
        <div className="base10-label">일 모형</div>
        <div className="base10-ones">
          {ones.map((index) => (
            <span key={`o-${index}`} className="base10-one">
              ■
            </span>
          ))}
          {onesCount > totalPieces ? <span className="base10-overflow">+{onesCount - totalPieces}</span> : null}
        </div>
      </div>
    </div>
  );
};

const buildSlicePath = (sliceIndex, totalSlices, radius = 44) => {
  const startAngle = (sliceIndex / totalSlices) * Math.PI * 2 - Math.PI / 2;
  const endAngle = ((sliceIndex + 1) / totalSlices) * Math.PI * 2 - Math.PI / 2;
  const cx = 60;
  const cy = 60;
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

export const ManipulativeFractionCuts = ({ visual = {}, seed = '' }) => {
  const safeSeed = `${parseSeed(visual)}-${seed}`;
  const totalSlices = Math.min(12, Math.max(2, clampPositiveInteger(visual?.totalSlices || visual?.denominator, 2)));
  const initialColored = clampPositiveInteger(visual?.coloredCount, 1);
  const initial = useMemo(
    () => Array.from({ length: totalSlices }, (_, index) => index < initialColored),
    [totalSlices, initialColored]
  );
  const [isCut, setIsCut] = useState(false);
  const [colored, setColored] = useState(initial);
  const swipeRef = useRef({ x: 0, y: 0 });
  const [activeCount, setActiveCount] = useState(initialColored);

  useEffect(() => {
    setIsCut(false);
    setColored(Array.from({ length: totalSlices }, (_, index) => index < initialColored));
    setActiveCount(initialColored);
  }, [initialColored, totalSlices, safeSeed]);

  useEffect(() => {
    setActiveCount(colored.filter(Boolean).length);
  }, [colored]);

  const colorHue = deterministicRange(`${safeSeed}-color`, 18, 45);
  const color = `hsl(${colorHue} 84% 70%)`;

  const runCut = () => {
    setIsCut(true);
  };

  const onPointerDown = (event) => {
    swipeRef.current = {
      x: event.clientX || 0,
      y: event.clientY || 0
    };
  };

  const onPointerUp = (event) => {
    const start = swipeRef.current;
    const endX = event.clientX || 0;
    const endY = event.clientY || 0;
    const dx = endX - start.x;
    const dy = endY - start.y;
    if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy)) {
      runCut();
    }
  };

  const toggleSlice = (index) => {
    if (!isCut) {
      runCut();
      return;
    }

    setColored((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="manipulative-card">
      <p className="visual-caption">{visual.prompt || '분수 조각을 쪼개고 색칠해보세요.'}</p>
      <p className="visual-subtitle">원형을 스와이프해서 조각 수를 정하고, 조각을 눌러 색칠하세요.</p>

      <div className="fraction-wrap">
        <div
          className="fraction-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {!isCut ? (
            <button
              type="button"
              className="glass-btn primary-bg fraction-cut-btn"
              onClick={runCut}
            >
              조각 자르기
            </button>
          ) : (
            <svg className="fraction-canvas" viewBox="0 0 120 120" aria-label="분수 조각">
              {Array.from({ length: totalSlices }).map((_, index) => (
                <path
                  key={`slice-${index}`}
                  className={`fraction-slice ${colored[index] ? 'filled' : ''}`}
                  d={buildSlicePath(index, totalSlices)}
                  fill={colored[index] ? color : 'rgba(255,255,255,0.58)'}
                  stroke="rgba(63,114,175,0.95)"
                  onClick={() => toggleSlice(index)}
                />
              ))}
              <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(63,114,175,0.72)" strokeWidth="3" />
            </svg>
          )}
        </div>

        <p className="fraction-state">
          색칠한 조각: {activeCount}/{totalSlices}
        </p>
      </div>
    </div>
  );
};
