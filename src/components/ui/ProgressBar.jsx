import React from 'react';

const ProgressBar = ({ current, total }) => {
  const safeTotal = Math.max(1, Number(total) || 1);
  const safeCurrent = Math.max(0, Math.min(Number(current) || 0, safeTotal));
  const percent = (safeCurrent / safeTotal) * 100;

  return (
    <div className="progress-wrap" role="progressbar" aria-label="문제 진행률">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-label">{safeCurrent}/{safeTotal} 문제</span>
    </div>
  );
};

export default ProgressBar;
