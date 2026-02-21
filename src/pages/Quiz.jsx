import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Keypad from '../components/ui/Keypad';
import ProgressBar from '../components/ui/ProgressBar';
import { generateRandomProblem } from '../utils/mathEngine';
import { saveWrongProblem } from '../utils/storageEngine';

const TOTAL_QUESTIONS = 12;
const INITIAL_TIME_BY_LEVEL = {
  1: 60,
  2: 70,
  3: 85,
  4: 100
};

const Quiz = () => {
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(() => generateRandomProblem(1));
  const [input, setInput] = useState('');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [comboPulse, setComboPulse] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => INITIAL_TIME_BY_LEVEL[1]);
  const [isFinished, setIsFinished] = useState(false);

  const total = useMemo(() => {
    const map = { 1: 10, 2: 12, 3: 14, 4: 16 };
    return map[level] || TOTAL_QUESTIONS;
  }, [level]);

  const restart = (nextLevel = level) => {
    setProblem(generateRandomProblem(nextLevel));
    setInput('');
    setIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsWrong(false);
    setIsCorrect(false);
    setComboPulse(false);
    setTimeLeft(INITIAL_TIME_BY_LEVEL[nextLevel] || INITIAL_TIME_BY_LEVEL[1]);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

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
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prevMax) => Math.max(prevMax, nextCombo));

      if (nextCombo >= 2) {
        setComboPulse(true);
        setTimeout(() => setComboPulse(false), 500);
      }

      setScore((prevScore) => prevScore + 10 + nextCombo * 2);
      setTimeout(() => {
        setIsCorrect(false);
        moveNextProblem();
      }, 450);
      return;
    }

    saveWrongProblem({
      ...problem,
      failCount: 1,
      lastAttempt: new Date().toISOString()
    });

    setCombo(0);
    setIsWrong(true);
    setInput('');
    setTimeout(() => setIsWrong(false), 350);
  };

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

  const timerClass = timeLeft <= 10 ? 'timer warning' : 'timer';

  return (
    <div className="container animate-fade-in" style={{ justifyContent: 'flex-start', paddingTop: '1rem' }}>
      <h2 className="page-header">퀴즈 모드</h2>
      <div className="math-panel">
        <div className="math-toolbar">
          <label className="math-label" htmlFor="quiz-level">
            난이도
          </label>
          <select
              id="quiz-level"
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
          <span className={timerClass}>{timeLeft}초</span>
        </div>

        <ProgressBar current={Math.min(index + 1, total)} total={total} />

        <p className="subtitle" style={{ margin: '0.4rem 0 1rem' }}>
          제한 시간 안에 {total}문제를 퀴즈처럼 풀어보세요.
        </p>

        {isFinished ? (
          <div className="result-overlay">
            <div className="result-card glass-panel">
              <h3 className="result-title">퀴즈 종료</h3>
              <p className="result-sub">최종 점수: {score}점</p>
              <p className="result-sub">연속 정답: 최고 {maxCombo}연속</p>
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
              <p className="quiz-meta">레벨 {level} · {index + 1}번째 · 점수 {score}</p>
              <p className="problem-text">
                {problem.num1} {problem.operator} {problem.num2} = ?
              </p>

              <div className="answer-shell">
                <span className={`math-answer ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                  {input || '0'}
                </span>
              </div>

              <p className={`feedback ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                {isCorrect && '정답!'}
                {isWrong && '오답이네요!'}
              </p>

              <div className={`combo-chip ${comboPulse ? 'pop' : ''}`}>
                {combo >= 2 ? `🔥 ${combo} 콤보!` : ''}
              </div>
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

export default Quiz;
