import React from 'react';
import {
  ManipulativeBase10,
  ManipulativeFractionCuts,
  ManipulativeSplitCombine
} from './ui/InteractiveGrid';

const toSeedNumber = (raw) => {
  const source = String(raw ?? '');
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash >>>= 0;
    hash *= 16777619;
    hash >>>= 0;
  }
  return hash;
};

const deterministicRange = (seed, min, max) => {
  const span = max - min;
  return (toSeedNumber(seed) % (span + 1)) + min;
};

export const ShapeGroup = ({ visual }) => {
  const target = visual?.target || '🔺';
  const items = Array.isArray(visual?.items) ? visual.items : [];

  const shapeCells = items.map((item, index) => {
    const left = `${deterministicRange(`${item}-${index}-left`, 6, 89)}%`;
    const top = `${deterministicRange(`${item}-${index}-top`, 12, 82)}%`;
    const offsetX = deterministicRange(`${item}-${index}-offset-x`, -17, 17);
    const offsetY = deterministicRange(`${item}-${index}-offset-y`, -12, 12);
    const floatDelay = deterministicRange(`${item}-${index}-float-delay`, 0, 1800) / 1000;
    const floatDuration = deterministicRange(`${item}-${index}-float-duration`, 2800, 4200) / 1000;

    return (
      <span
        key={`${item}-${index}`}
        className="shape-item animate-float"
        style={{
          left,
          top,
          '--offset-x': `${offsetX}px`,
          '--offset-y': `${offsetY}px`,
          '--float-delay': `${floatDelay.toFixed(2)}s`,
          '--float-duration': `${floatDuration.toFixed(2)}s`
        }}
      >
        {item}
      </span>
    );
  });

  return (
    <div className="shape-group-wrap">
      <p className="visual-caption">‘{target}’ 개수를 세보세요.</p>
      <div className="shape-group">{shapeCells}</div>
      <p className="visual-subtitle">타겟 모양만 정확히 세고 정답을 입력하세요.</p>
    </div>
  );
};

export const AnalogClock = ({ time = {} }) => {
  const hour = Number.isFinite(time.hour) ? Number(time.hour) : 0;
  const minute = Number.isFinite(time.minute) ? Number(time.minute) : 0;
  const minuteRatio = (minute / 60) * 360;
  const hourRatio = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

  return (
    <div className="clock-wrap">
      <p className="visual-caption">시계 바늘을 보고 시간을 읽어보세요.</p>
      <div className="analog-clock">
        <span className="clock-hand hour-hand" style={{ transform: `rotate(${hourRatio}deg)` }} />
        <span className="clock-hand minute-hand" style={{ transform: `rotate(${minuteRatio}deg)` }} />
      </div>
      <p className="visual-subtitle">
        정답은 시각을 ‘시각의 시와 분을 합쳐’ hhmm 형식으로 입력해요.
      </p>
    </div>
  );
};

export const SimpleBarChart = ({ visual = {} }) => {
  const data = Array.isArray(visual.data) ? visual.data : [];
  const values = data.map((entry) => Number(entry.value || 0));
  const maxValue = Math.max(1, ...values);

  return (
    <div className="chart-wrap">
      <p className="visual-caption">{visual.question || '자료를 보고 차이를 구하세요.'}</p>
      <div className="simple-chart">
        {data.map((entry, index) => {
          const ratio = `${Math.max(10, Math.round((Number(entry.value || 0) / maxValue) * 100))}%`;
          return (
            <div className="bar-cell" key={`${entry.label}-${index}`}>
              <span className="bar" style={{ height: ratio }} />
              <span className="bar-label">{entry.label}</span>
              <span className="bar-value">{entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MeasurementLength = ({ visual = {} }) => {
  const items = Array.isArray(visual.items) ? visual.items : [];
  const maxValue = Math.max(2, ...items.map((item) => Number(item?.value || 2)));

  return (
    <div className="measurement-wrap">
      <p className="visual-caption">{visual.question || '길이 차이를 비교해 보세요.'}</p>
      <div className="measurement-track">
        {items.map((item, index) => (
          <div key={`${item?.label}-${index}`} className="measure-item">
            <span className="measure-label">{item?.label || `물체 ${index + 1}`}</span>
            <div
              className="measure-bar"
              style={{
                width: `${Math.round((Number(item?.value || 0) / maxValue) * 100)}%`
              }}
            />
            <span className="bar-value">{item?.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ZeroConcept = ({ visual = {} }) => {
  const prompt = String(visual.prompt || '접시에 사과가 몇 개 있나요?');
  const count = Number.isFinite(Number(visual.count)) ? Math.max(0, Math.round(Number(visual.count))) : 0;
  const shownCount = Math.min(9, count);
  const applePositions = [
    { left: '50%', top: '30%' },
    { left: '35%', top: '40%' },
    { left: '65%', top: '40%' },
    { left: '25%', top: '50%' },
    { left: '50%', top: '50%' },
    { left: '75%', top: '50%' },
    { left: '35%', top: '62%' },
    { left: '65%', top: '62%' },
    { left: '50%', top: '70%' }
  ];

  return (
    <div className="zero-concept-wrap">
      <p className="visual-caption">{prompt}</p>
      <div className="zero-plate-stage" aria-hidden="true">
        <svg className="zero-plate-svg zero-plate-svg-large" viewBox="0 0 360 210" role="presentation">
          <ellipse className="zero-plate-shadow" cx="180" cy="138" rx="128" ry="42" />
          <ellipse className="zero-plate-rim" cx="180" cy="118" rx="138" ry="58" />
          <ellipse className="zero-plate-inner" cx="180" cy="118" rx="106" ry="40" />
          <ellipse className="zero-plate-gloss" cx="132" cy="95" rx="34" ry="11" />
        </svg>
        <div className="zero-apple-layer">
          {Array.from({ length: shownCount }).map((_, index) => (
            <span
              key={`zero-apple-${index}`}
              className="zero-apple"
              style={{
                left: applePositions[index].left,
                top: applePositions[index].top
              }}
            >
              🍎
            </span>
          ))}
        </div>
      </div>
      <p className="visual-subtitle">그림을 보고 개수를 숫자로 입력해 보세요.</p>
    </div>
  );
};

export const SequencePrompt = ({ visual = {} }) => {
  const prompt = String(visual.prompt || '순서를 보고 다음 수를 추론해 보세요.');
  const hasBaseNumber = Number.isFinite(Number(visual?.number));

  return (
    <div className="sequence-wrap">
      <p className="visual-caption">{prompt}</p>
      <div className="sequence-line">
        {hasBaseNumber ? (
          <span className="sequence-number">
            {visual?.number}
          </span>
        ) : null}
      </div>
      <p className="visual-subtitle">순서의 규칙을 떠올리면 정답을 쉽게 찾을 수 있어요.</p>
    </div>
  );
};

export const CompareVisual = ({ visual = {} }) => {
  const leftCount = Number.isFinite(Number(visual.left?.count)) ? Math.max(0, Math.round(Number(visual.left?.count))) : 0;
  const rightCount = Number.isFinite(Number(visual.right?.count)) ? Math.max(0, Math.round(Number(visual.right?.count))) : 0;
  const leftLabel = visual.left?.label || 'A';
  const rightLabel = visual.right?.label || 'B';

  return (
    <div className="compare-wrap">
      <p className="visual-caption">{visual.question || '왼쪽과 오른쪽 개수를 비교해 보세요.'}</p>
      <div className="compare-row">
        <div className="compare-group">
          <p className="compare-group-label">왼쪽</p>
          <div className="compare-items">
            {Array.from({ length: Math.min(9, leftCount) }).map((_, index) => (
              <span key={`left-${index}`} className="compare-item">{leftLabel}</span>
            ))}
          </div>
          <p className="compare-count">개수: {leftCount}</p>
        </div>
        <p className="compare-symbol" aria-hidden="true">VS</p>
        <div className="compare-group">
          <p className="compare-group-label">오른쪽</p>
          <div className="compare-items">
            {Array.from({ length: Math.min(9, rightCount) }).map((_, index) => (
              <span key={`right-${index}`} className="compare-item">{rightLabel}</span>
            ))}
          </div>
          <p className="compare-count">개수: {rightCount}</p>
        </div>
      </div>
      <p className="visual-subtitle">두 그룹의 개수 차이를 숫자로 입력해 보세요.</p>
    </div>
  );
};

export const ProblemRenderer = ({ problem }) => {
  if (!problem) return null;

  if (!problem.visual) {
    return <p className="problem-text">{problem.num1} {problem.operator} {problem.num2} = ?</p>;
  }

  if (problem.visual.type === 'interactive') {
    const seed = problem.seed || problem.visual.seed;
    const num1Text = Number.isFinite(Number(problem?.num1))
      ? Number(problem.num1)
      : '?';
    const num2Text = Number.isFinite(Number(problem?.num2))
      ? Number(problem.num2)
      : '?';
    const operatorText = String(problem?.operator || '+');
    const renderFormula = (
      <p className="problem-text">
        {num1Text} {operatorText} {num2Text} = ?
      </p>
    );

    if (problem.visual.subType === 'split-combine') {
      return (
        <>
          {renderFormula}
          <ManipulativeSplitCombine visual={problem.visual} seed={seed} />
        </>
      );
    }

    if (problem.visual.subType === 'base-10-blocks') {
      return (
        <>
          {renderFormula}
          <ManipulativeBase10 visual={problem.visual} seed={seed} />
        </>
      );
    }

    if (problem.visual.subType === 'fraction-cuts') {
      return (
        <>
          {renderFormula}
          <ManipulativeFractionCuts visual={problem.visual} seed={seed} />
        </>
      );
    }
  }

  if (problem.visual.type === 'count-shapes') return <ShapeGroup visual={problem.visual} />;
  if (problem.visual.type === 'clock-reading') return <AnalogClock time={problem.visual.time} />;
  if (problem.visual.type === 'chart-bar') return <SimpleBarChart visual={problem.visual} />;
  if (problem.visual.type === 'measurement-length') return <MeasurementLength visual={problem.visual} />;
  if (problem.visual.type === 'zero-concept') return <ZeroConcept visual={problem.visual} />;
  if (problem.visual.type === 'sequence') return <SequencePrompt visual={problem.visual} />;
  if (problem.visual.type === 'compare') return <CompareVisual visual={problem.visual} />;

  return null;
};
