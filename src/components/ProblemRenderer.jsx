import React from 'react';

const shuffleArray = (values) => {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const ShapeGroup = ({ visual }) => {
  const target = visual?.target || '🔺';
  const items = shuffleArray(Array.isArray(visual?.items) ? visual.items : []);

  const shapeCells = items.map((item, index) => {
    const left = `${Math.floor(Math.random() * 83) + 6}%`;
    const top = `${Math.floor(Math.random() * 71) + 12}%`;
    const offsetX = (Math.random() * 34) - 17;
    const offsetY = (Math.random() * 24) - 12;

    return (
      <span
        key={`${item}-${index}`}
        className="shape-item animate-float"
        style={{
          left,
          top,
          '--offset-x': `${offsetX}px`,
          '--offset-y': `${offsetY}px`,
          '--float-delay': `${(Math.random() * 1.8).toFixed(2)}s`,
          '--float-duration': `${(2.8 + Math.random() * 1.4).toFixed(2)}s`
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

export const ProblemRenderer = ({ problem }) => {
  if (!problem) return null;

  if (!problem.visual) {
    return <p className="problem-text">{problem.num1} {problem.operator} {problem.num2} = ?</p>;
  }

  if (problem.visual.type === 'count-shapes') return <ShapeGroup visual={problem.visual} />;
  if (problem.visual.type === 'clock-reading') return <AnalogClock time={problem.visual.time} />;
  if (problem.visual.type === 'chart-bar') return <SimpleBarChart visual={problem.visual} />;

  return null;
};
