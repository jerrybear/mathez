import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Keypad from '../components/ui/Keypad';
import ProgressBar from '../components/ui/ProgressBar';
import { generateSimilarProblem } from '../utils/mathEngine';
import { getWrongProblems, removeWrongProblem } from '../utils/storageEngine';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ko-KR');
};

const Review = () => {
  const [wrongProblems, setWrongProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [reviewProblem, setReviewProblem] = useState(null);
  const [input, setInput] = useState('');
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    setWrongProblems(getWrongProblems('latest'));
  }, []);

  const selectProblem = (problem) => {
    const next = generateSimilarProblem(problem);
    setSelectedProblem(problem);
    setReviewProblem(next || problem);
    setInput('');
    setIsWrong(false);
    setIsCorrect(false);
    setCelebrating(false);
  };

  const completeReview = () => {
    if (!selectedProblem) return;

    const nextList = removeWrongProblem(selectedProblem.id);
    setWrongProblems(nextList);
    setSelectedProblem(null);
    setReviewProblem(null);
  };

  const backToList = () => {
    setSelectedProblem(null);
    setReviewProblem(null);
    setInput('');
    setIsCorrect(false);
    setIsWrong(false);
    setCelebrating(false);
  };

  const handleSubmit = () => {
    if (!reviewProblem || input === '') return;

    const numeric = Number(input);
    if (!Number.isFinite(numeric)) return;

    if (numeric === reviewProblem.answer) {
      setIsCorrect(true);
      setCelebrating(true);
      setTimeout(() => {
        setIsCorrect(false);
        completeReview();
      }, 650);
      return;
    }

    setIsWrong(true);
    setTimeout(() => setIsWrong(false), 350);
    setInput('');
  };

  const handleKeyPress = (key) => {
    if (!reviewProblem) return;

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
      <h2 className="page-header">복습 모드</h2>
      <div className="math-panel">
        <div className="math-toolbar">
          <span className="math-label">내 오답 노트</span>
          <button
            type="button"
            className="glass-btn accent-bg"
            onClick={() => setWrongProblems(getWrongProblems('latest'))}
            style={{ padding: '0.45rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={16} />
            새로고침
          </button>
        </div>

        {!selectedProblem ? (
          <>
            <ProgressBar current={0} total={Math.max(1, wrongProblems.length)} />

            {wrongProblems.length === 0 ? (
              <p className="subtitle">틀린 문제가 없습니다. 먼저 학습/퀴즈에서 오답을 만들어보세요.</p>
            ) : (
              <div style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
                {wrongProblems.map((problem) => (
                  <button
                    key={problem.id}
                    type="button"
                    className="glass-btn"
                    onClick={() => selectProblem(problem)}
                    style={{ padding: '0.9rem', textAlign: 'left' }}
                  >
                    <p style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                      {problem.num1} {problem.operator} {problem.num2}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(63, 114, 175, 0.9)' }}>
                      오답 횟수: {problem.failCount}회 · 마지막: {formatDate(problem.lastAttempt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="problem-card glass-panel">
              <p className="quiz-meta">유사문제 복습</p>
              <p className="problem-text">
                {reviewProblem.num1} {reviewProblem.operator} {reviewProblem.num2} = ?
              </p>
              <p className="learning-hint">
                원본 오답: {selectedProblem.num1} {selectedProblem.operator} {selectedProblem.num2}
              </p>

              <div className="answer-shell">
                <span className={`math-answer ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                  {input || '0'}
                </span>
              </div>

              <p className={`feedback ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                {isCorrect && '훌륭해요! 오답 노트에서 제거됩니다 🎉'}
                {isWrong && '아직 안 맞아요. 한번 더!'}
                {!isWrong && !isCorrect && '답을 입력하고 Enter를 눌러주세요.'}
              </p>

              {celebrating ? <div className="combo-chip pop">정답! 복습 완료!</div> : null}
            </div>

            <button
              type="button"
              className="glass-btn secondary-bg"
              onClick={backToList}
              style={{ width: '100%', padding: '0.75rem 1rem' }}
            >
              목록으로
            </button>

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

export default Review;
