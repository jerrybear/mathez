import React from 'react';

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

export const ProblemRenderer = ({ problem }) => {
  if (!problem) return null;

  if (!problem.visual) {
    return <p className="problem-text">{problem.num1} {problem.operator} {problem.num2} = ?</p>;
  }

  if (problem.visual.type === 'count-shapes') return <ShapeGroup visual={problem.visual} />;
  if (problem.visual.type === 'clock-reading') return <AnalogClock time={problem.visual.time} />;
  if (problem.visual.type === 'chart-bar') return <SimpleBarChart visual={problem.visual} />;
  if (problem.visual.type === 'measurement-length') return <MeasurementLength visual={problem.visual} />;

  return null;
};
