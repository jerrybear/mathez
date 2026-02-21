import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Keypad from '../components/ui/Keypad';
import ProgressBar from '../components/ui/ProgressBar';
import { generateRandomProblem } from '../utils/mathEngine';
import { saveWrongProblem } from '../utils/storageEngine';

const questionCountByLevel = {
  1: 8,
  2: 10,
  3: 12,
  4: 14
};

const getTotalByLevel = (level) => questionCountByLevel[level] || 10;
const HINT_STEPS = 3;

const clampHintStep = (value) => Math.max(1, Math.min(value, HINT_STEPS));

const formatAppleRow = (count) => {
  const safeCount = Math.max(0, Number(count) || 0);
  const shown = Math.min(safeCount, 8);
  return `${'🍎'.repeat(shown)}${safeCount > shown ? '…' : ''}`;
};

const formatAddHint = (num1, num2, step) => {
  if (step <= 1) {
    return `🍎 나눠서 보기: ${formatAppleRow(num1)} + ${formatAppleRow(num2)}`;
  }

  if (step === 2) {
    return `${num1}개 그룹과 ${num2}개 그룹을 합치면 ${num1 + num2}개가 돼요.`;
  }

  const split = Math.floor(num1 / 2);
  return `${split} + ${num1 - split} + ${num2} = ${num1 + num2}`;
};

const formatSubtractHint = (num1, num2, step) => {
  if (step <= 1) {
    return `🍎 전체 ${formatAppleRow(num1)}에서 ${formatAppleRow(num2)}만큼 빼기`;
  }

  if (step === 2) {
    return `먼저 ${num1}개를 쭉 세고, ${num2}개를 제외해 보세요.`;
  }

  return `${num2}개를 먼저 빼고 남은 수가 정답입니다.`;
};

const formatMultiplyHint = (num1, num2, step) => {
  if (step <= 1) {
    return `${num1} x ${num2}는 ${num2}번의 ${num1} 덧셈으로 볼 수 있어요.`;
  }

  if (step === 2) {
    return `${Array(Math.min(num2, 6)).fill(`${num1}`).join(' + ')}${num2 > 6 ? ' + ...' : ''} = ${num1 * num2}`;
  }

  return `${num1} × ${num2} = ${num1 * num2} (짝수/배수 관계로 빠르게 계산)`;
};

const formatDivideHint = (num1, num2, step) => {
  if (step <= 1) {
    return `${num1}을(를) ${num2}명에게 똑같이 나눠주면 몇 개씩 가질까요?`;
  }

  if (step === 2) {
    return `${num2}개씩 채워서 ${num1 / num2}번째 상자까지 보면 됩니다.`;
  }

  return `${num2}개씩 묶었을 때 정확히 ${num1 / num2}묶음입니다.`;
};

const buildLearningHint = (problem, wrongAttempts) => {
  if (wrongAttempts <= 0) return null;

  const step = clampHintStep(wrongAttempts);
  const { num1, num2, operator } = problem;

  if (operator === '+') return formatAddHint(num1, num2, step);
  if (operator === '-') return formatSubtractHint(num1, num2, step);
  if (operator === '*') return formatMultiplyHint(num1, num2, step);
  if (operator === '/') return formatDivideHint(num1, num2, step);

  return '숫자 하나씩 천천히 따라 해보세요.';
};

const Learning = () => {
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(() => generateRandomProblem(1));
  const [input, setInput] = useState('');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const total = getTotalByLevel(level);

  const restart = (nextLevel = level) => {
    setProblem(generateRandomProblem(nextLevel));
    setInput('');
    setIndex(0);
    setScore(0);
    setIsCorrect(false);
    setIsWrong(false);
    setWrongAttempts(0);
    setIsFinished(false);
  };

  const moveNextProblem = () => {
    const nextIndex = index + 1;

    if (nextIndex >= total) {
      setIsFinished(true);
      return;
    }

    setIndex(nextIndex);
    setProblem(generateRandomProblem(level));
    setInput('');
    setIsCorrect(false);
  };

  const handleSubmit = () => {
    if (isFinished || input === '') return;

    const numeric = Number(input);
    if (!Number.isFinite(numeric)) return;

    if (numeric === problem.answer) {
      setIsCorrect(true);
      setScore((prev) => prev + 1);
      setWrongAttempts(0);
      setTimeout(() => {
        setIsCorrect(false);
        moveNextProblem();
      }, 500);
      return;
    }

    saveWrongProblem({
      ...problem,
      failCount: 1,
      lastAttempt: new Date().toISOString()
    });

    setIsWrong(true);
    setWrongAttempts((prev) => prev + 1);
    setInput('');
    setTimeout(() => setIsWrong(false), 400);
  };

  const hintText = buildLearningHint(problem, wrongAttempts);

  const handleKeyPress = (key) => {
    if (isFinished) return;

    if (key === 'del') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'enter') {
      handleSubmit();
      return;
    }

    if (typeof key === 'number' && input.length < 6) {
      setInput((prev) => prev + String(key));
    }
  };

  return (
    <div className="container animate-fade-in" style={{ justifyContent: 'flex-start', paddingTop: '1rem' }}>
      <h2 className="page-header">학습 모드</h2>
      <div className="math-panel">
        <div className="math-toolbar">
          <label className="math-label" htmlFor="learning-level">
            난이도
          </label>
            <select
              id="learning-level"
              className="level-select"
              value={level}
              onChange={(e) => {
                const nextLevel = Number(e.target.value);
                setLevel(nextLevel);
                restart(nextLevel);
              }}
            >
            <option value={1}>레벨 1 (기초)</option>
            <option value={2}>레벨 2</option>
            <option value={3}>레벨 3</option>
            <option value={4}>레벨 4</option>
          </select>
        </div>

        <ProgressBar current={Math.min(index + 1, total)} total={total} />

        <p className="subtitle" style={{ margin: '0.6rem 0 1rem' }}>
          정답 입력 후 Enter를 눌러주세요.
        </p>

        {isFinished ? (
          <div className="result-overlay">
            <div className="result-card glass-panel">
              <h3 className="result-title">학습 완료!</h3>
              <p className="result-sub">
                {score} / {total} 문제 정답
              </p>
              <div className="modal-buttons">
                <button type="button" className="glass-btn primary-bg" onClick={restart}>
                  다시 시작
                </button>
                <Link to="/" className="glass-btn secondary-bg" style={{ gap: '0.5rem' }}>
                  <ArrowLeft size={18} />
                  홈으로
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="problem-card glass-panel">
              <p className="problem-caption">현재 문제</p>
              <p className="problem-text">
                {problem.num1} {problem.operator} {problem.num2} = ?
              </p>
              <div className="answer-shell">
                <span className={`math-answer ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                  {input || '0'}
                </span>
              </div>
              <p className={`feedback ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                {isCorrect && '정답입니다! ✨'}
                {isWrong && '조금만 더 생각해볼까요?'}
              </p>
              {hintText ? <p className="learning-hint">{hintText}</p> : null}
            </div>

            <Keypad onKeyPress={handleKeyPress} />
          </>
        )}
      </div>
      <Link to="/" className="glass-btn back-btn" style={{ gap: '0.5rem', alignSelf: 'center' }}>
        <ArrowLeft size={20} /> 홈으로
      </Link>
    </div>
  );
};

export default Learning;
