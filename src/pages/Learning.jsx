import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Keypad from '../components/ui/Keypad';
import ProgressBar from '../components/ui/ProgressBar';
import { ProblemRenderer } from '../components/ProblemRenderer';
import { generateProblem } from '../utils/mathEngine';
import { saveWrongProblem } from '../utils/storageEngine';
import curriculumCatalog, { getCurriculumById } from '../data/curriculum';
import { getLearningProgressMap, getLearningStreak, saveLearningProgress } from '../utils/learningProgress';
import {
  createPlaceInputState,
  getDigitsFromNumber,
  getSemiStepDisplay,
  isSemiStepCandidate,
  initialActivePlaceIndex,
  nextSemiStepActiveIndex,
  normalizeIndexInput,
  toSemiStepValue
} from '../utils/semiStepUtils';

const HINT_STEPS = 3;
const HINT_TRIGGER_STEP = 1;
const CONFETTI_COUNT = 24;
const clampHintStep = (value) => Math.max(1, Math.min(value, HINT_STEPS));
const GRADE_OPTIONS = [1, 2, 3];
const SEMESTER_OPTIONS = [1, 2];

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
    return `먼저 ${num1}개를 세고, ${num2}개를 제외해 보세요.`;
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

const createCarryBorrowGuide = (problem = null) => {
  if (!problem || !['+', '-'].includes(problem.operator)) {
    return { carry: {}, borrow: {} };
  }

  const operator = problem.operator;
  const num1Digits = getDigitsFromNumber(problem.num1);
  const num2Digits = getDigitsFromNumber(problem.num2);
  const maxLen = Math.max(num1Digits.length, num2Digits.length);
  const carry = {};
  const borrow = {};

  if (operator === '+') {
    let carryOver = 0;
    for (let i = 0; i < maxLen; i += 1) {
      const n1 = Number(num1Digits[i] || 0);
      const n2 = Number(num2Digits[i] || 0);
      const total = n1 + n2 + carryOver;

      if (Math.floor(total / 10) > 0) {
        carry[i + 1] = 1;
      }

      carryOver = Math.floor(total / 10);
    }
    return { carry, borrow };
  }

  let borrowFromLower = 0;
  for (let i = 0; i < maxLen; i += 1) {
    const n1 = Number(num1Digits[i] || 0) - borrowFromLower;
    const n2 = Number(num2Digits[i] || 0);

    if (n1 < n2) {
      borrow[i + 1] = 1;
      borrowFromLower = 1;
    } else {
      borrowFromLower = 0;
    }
  }

  return { carry, borrow };
};


const createConfettiPieces = () => {
  const colors = ['#FF7E67', '#FFD460', '#A2D5AB', '#3F72AF', '#F7A072'];
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
    id: `confetti-${index}-${Date.now()}`,
    left: `${Math.random() * 100}%`,
    driftX: `${(Math.random() * 100 - 50).toFixed(1)}px`,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.floor(Math.random() * 7),
    delay: `${(Math.random() * 0.65).toFixed(2)}s`,
    duration: `${(1.2 + Math.random() * 1.2).toFixed(2)}s`,
    borderRadius: Math.random() < 0.5 ? '50%' : '2px',
    rotation: `${Math.floor(Math.random() * 360)}deg`
  }));
};

const getGuideLabel = (guide = {}, index = 0, operator = '') => {
  if (operator === '+' && guide.carry?.[index]) {
    return { type: 'carry', text: `+${guide.carry[index]}` };
  }

  if (operator === '-' && guide.borrow?.[index]) {
    return { type: 'borrow', text: '↘1' };
  }

  return null;
};

const placeLabel = (index) => {
  const bases = ['일', '십', '백', '천', '만'];
  return `${bases[index] || `${index}의`} 자리`;
};

const pickRandomOperation = (chapter) => {
  const operations = chapter?.operations || ['+'];
  if (!operations.length) return '+';

  const randomIndex = Math.floor(Math.random() * operations.length);
  return operations[randomIndex];
};

const Learning = () => {
  const [viewMode, setViewMode] = useState('curriculum');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [problem, setProblem] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [placeInputs, setPlaceInputs] = useState([]);
  const [activePlaceIndex, setActivePlaceIndex] = useState(0);
  const [isSemiStep, setIsSemiStep] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [progressMap, setProgressMap] = useState(() => getLearningProgressMap());
  const [streakCount, setStreakCount] = useState(() => getLearningStreak().streak);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [semiStepGuide, setSemiStepGuide] = useState({ carry: {}, borrow: {} });
  const [tutorialStep, setTutorialStep] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);

  const selectedChapter = getCurriculumById(selectedChapterId);
  const total = selectedChapter ? selectedChapter.questionCount : 0;
  const selectedChapterProgress = selectedChapter ? progressMap[selectedChapter.id] : null;
  const tutorialSteps = selectedChapter?.tutorialSteps?.length
    ? selectedChapter.tutorialSteps
    : (selectedChapter?.concept || []);
  const activeTutorialStep = tutorialSteps[tutorialStep] || null;
  const filteredCurriculum = curriculumCatalog.filter(
    (chapter) =>
      Number(chapter.grade) === Number(selectedGrade) &&
      Number(chapter.semester) === Number(selectedSemester)
  );
  const gradeCurriculum = curriculumCatalog.filter(
    (chapter) => Number(chapter.grade) === Number(selectedGrade)
  );
  const gradeTotalQuestions = gradeCurriculum.reduce((sum, chapter) => {
    const count = Number(chapter.questionCount);
    return sum + (Number.isFinite(count) ? Math.max(0, Math.round(count)) : 0);
  }, 0);
  const gradeCompletedQuestions = gradeCurriculum.reduce((sum, chapter) => {
    const chapterProgress = progressMap[chapter.id];
    if (!chapterProgress) return sum;
    if (chapterProgress.completed) return sum + Number(chapter.questionCount || 0);
    return sum + Math.max(0, Number(chapterProgress.currentIndex || 0));
  }, 0);
  const gradeCompletedChapters = gradeCurriculum.reduce((sum, chapter) => {
    return progressMap[chapter.id]?.completed ? sum + 1 : sum;
  }, 0);
  const semesterCompletedChapters = filteredCurriculum.reduce((sum, chapter) => {
    return progressMap[chapter.id]?.completed ? sum + 1 : sum;
  }, 0);
  const safeGradeCompletedQuestions = Math.max(0, Math.round(gradeCompletedQuestions));
  const safeGradeTotalQuestions = Math.max(0, Math.round(gradeTotalQuestions));

  const handleGradeSelect = (grade) => {
    const normalizedGrade = Number(grade);
    setSelectedGrade(normalizedGrade);
    setSelectedSemester(1);
    setProgressMap(getLearningProgressMap());
  };

  const handleSemesterSelect = (semester) => {
    setSelectedSemester(Number(semester));
  };

  const hasResumeProgress = Boolean(
    selectedChapterProgress &&
    !selectedChapterProgress.completed &&
    selectedChapterProgress.currentIndex > 0 &&
    selectedChapterProgress.currentIndex < total
  );

  const syncProgress = (overrides = {}) => {
    if (!selectedChapter) return;

    const next = saveLearningProgress({
      chapterId: selectedChapter.id,
      total,
      currentIndex: index,
      score,
      ...overrides
    });

    setProgressMap(next);
    setStreakCount(getLearningStreak().streak);
  };

  const configureProblemState = (nextProblem) => {
    setProblem(nextProblem);
    setWrongAttempts(0);
    setIsCorrect(false);
    setIsWrong(false);
    setIsHintOpen(false);

    const useSemiStep = isSemiStepCandidate(selectedChapter, nextProblem);
    setIsSemiStep(useSemiStep);

    if (useSemiStep) {
      setSemiStepGuide(createCarryBorrowGuide(nextProblem));
      setPlaceInputs(createPlaceInputState(nextProblem?.answer || 0));
      setActivePlaceIndex(initialActivePlaceIndex(nextProblem?.answer || 0));
      setInput('');
      return;
    }

    setSemiStepGuide({ carry: {}, borrow: {} });
    setPlaceInputs([]);
    setActivePlaceIndex(0);
    setInput('');
  };

  const createProblem = () => (selectedChapter
    ? generateProblem(
      selectedChapter.level,
      pickRandomOperation(selectedChapter),
      { topic: selectedChapter.topic, chapterId: selectedChapter.id, chapterTitle: selectedChapter.title }
    )
    : null);

  const goToCurriculum = () => {
    setViewMode('curriculum');
    setSelectedChapterId('');
    setProblem(null);
    setIndex(0);
    setScore(0);
    setInput('');
    setPlaceInputs([]);
    setActivePlaceIndex(0);
    setIsSemiStep(false);
    setIsCorrect(false);
    setIsWrong(false);
    setWrongAttempts(0);
    setIsHintOpen(false);
    setIsFinished(false);
    setShowConfetti(false);
    setConfettiPieces([]);
    setSemiStepGuide({ carry: {}, borrow: {} });
    setTutorialStep(0);
    setStreakCount(getLearningStreak().streak);
    setProgressMap(getLearningProgressMap());
  };

  const goToCurriculumWithSave = () => {
    if (viewMode === 'problem' && selectedChapter && !isFinished) {
      syncProgress({
        currentIndex: index,
        score,
        completed: isFinished
      });
    }
    goToCurriculum();
  };

  const openTutorial = (chapterId) => {
    const chapter = getCurriculumById(chapterId);
    if (!chapter) return;

    setSelectedChapterId(chapterId);
    setViewMode('tutorial');
    setProblem(null);
    setInput('');
    setPlaceInputs([]);
    setActivePlaceIndex(0);
    setIsSemiStep(false);
    setIndex(0);
    setScore(0);
    setIsCorrect(false);
    setIsWrong(false);
    setWrongAttempts(0);
    setIsHintOpen(false);
    setIsFinished(false);
    setShowConfetti(false);
    setConfettiPieces([]);
    setTutorialStep(0);
    setSemiStepGuide({ carry: {}, borrow: {} });
    setStreakCount(getLearningStreak().streak);
  };

  const startProblems = (resume = false) => {
    if (!selectedChapter) return;

    const nextIndex = resume && !selectedChapterProgress?.completed
      ? Number(selectedChapterProgress.currentIndex || 0)
      : 0;
    const nextScore = resume && !selectedChapterProgress?.completed
      ? Number(selectedChapterProgress.score || 0)
      : 0;

    const safeIndex = Math.min(Math.max(0, nextIndex), total);
    const safeScore = Math.max(0, Math.round(nextScore));
    setIndex(safeIndex);
    setScore(safeScore);
    setIsFinished(safeIndex >= total);
    setIsCorrect(false);
    setIsWrong(false);
    setIsHintOpen(false);
    setShowConfetti(false);
    setConfettiPieces([]);
    setTutorialStep(0);

    if (safeIndex >= total) {
      setProblem(null);
    } else {
      const firstProblem = createProblem();
      configureProblemState(firstProblem);
    }

    setViewMode('problem');
    syncProgress({ total, currentIndex: safeIndex, score: safeScore, completed: safeIndex >= total });
  };

  const moveToNextProblem = (nextIndex, nextScore) => {
    if (!selectedChapter) return;

    if (nextIndex >= total) {
      setIsFinished(true);
      setIsCorrect(false);
      setShowConfetti(true);
      setConfettiPieces(createConfettiPieces());
      syncProgress({
        currentIndex: nextIndex,
        score: nextScore,
        completed: true
      });
      return;
    }

    const nextProblem = createProblem();
    setIndex(nextIndex);
    setScore(nextScore);
    configureProblemState(nextProblem);
    syncProgress({
      currentIndex: nextIndex,
      score: nextScore,
      completed: false
    });
  };

  const getEnteredAnswer = () => {
    if (!problem) return null;

    if (!isSemiStep) {
      const numeric = Number(input);
      return Number.isFinite(numeric) ? numeric : null;
    }

    return toSemiStepValue(placeInputs);
  };

  const handleSubmit = () => {
    if (isFinished || !problem) return;

    const entered = getEnteredAnswer();
    if (entered === null) return;

    if (entered === problem.answer) {
      const nextIndex = index + 1;
      const nextScore = score + 1;

      setIsCorrect(true);
      setWrongAttempts(0);
      setTimeout(() => {
        setIsCorrect(false);
        moveToNextProblem(nextIndex, nextScore);
      }, 450);
      return;
    }

    saveWrongProblem({
      ...problem,
      failCount: 1,
      lastAttempt: new Date().toISOString()
    });

    setIsWrong(true);
    setWrongAttempts((prev) => prev + 1);
    syncProgress({ currentIndex: index, score, completed: false });
    setTimeout(() => setIsWrong(false), 350);
  };

  const handleTutorialStep = (nextStep) => {
    if (!tutorialSteps.length) return;
    const last = tutorialSteps.length - 1;
    const safe = Math.max(0, Math.min(nextStep, last));
    setTutorialStep(safe);
  };

  const handlePlaceKeyPress = (key) => {
    if (isFinished || !isSemiStep) return;

    if (key === 'del') {
      setPlaceInputs((prev) => {
        const next = [...prev];
        if (!next[activePlaceIndex]) {
          const previous = Math.max(0, activePlaceIndex - 1);
          setActivePlaceIndex(previous);
          if (next[previous]) next[previous] = '';
          return next;
        }
        next[activePlaceIndex] = '';
        return next;
      });
      return;
    }

    if (key === 'enter') {
      handleSubmit();
      return;
    }

    if (typeof key !== 'number') return;

    setPlaceInputs((prev) => {
      const next = [...prev];
      next[activePlaceIndex] = normalizeIndexInput(String(key));

      return next;
    });
    setActivePlaceIndex((prev) => nextSemiStepActiveIndex(prev));
  };

  const handleKeyPress = (key) => {
    if (isFinished) return;

    if (isSemiStep) {
      handlePlaceKeyPress(key);
      return;
    }

    if (key === '.') {
      if (input.includes('.')) return;
      setInput((prev) => (prev.length ? `${prev}.` : '0.'));
      return;
    }

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

  const currentAnswerText = isSemiStep ? getSemiStepDisplay(placeInputs) : (input || '0');
  const hintText = problem ? buildLearningHint(problem, wrongAttempts) : null;
  const shouldAutoHint = wrongAttempts >= HINT_TRIGGER_STEP;
  const canPrevStep = tutorialStep > 0;
  const canNextStep = tutorialStep < tutorialSteps.length - 1;

  return (
    <div className="container animate-fade-in" style={{ justifyContent: 'flex-start', paddingTop: '1rem' }}>
      <h2 className="page-header">학습 모드</h2>
      <div className="math-panel">
        {viewMode === 'curriculum' ? (
          <div className="curriculum-wrap">
            <p className="subtitle" style={{ marginBottom: '1rem' }}>
              학습할 단원을 골라주세요.
            </p>
            {streakCount > 0 ? <p className="streak-banner">🔥 {streakCount}일 연속 공부 중!</p> : null}
            <div className="curriculum-filter-wrap">
              <div className="curriculum-filter-row">
                <p className="curriculum-filter-title">학년</p>
                {GRADE_OPTIONS.map((grade) => {
                  const isActive = grade === selectedGrade;
                  return (
                    <button
                      type="button"
                      key={grade}
                      className={`curriculum-filter-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleGradeSelect(grade)}
                    >
                      {grade}학년
                    </button>
                  );
                })}
              </div>
              <div className="curriculum-filter-row">
                <p className="curriculum-filter-title">학기</p>
                {SEMESTER_OPTIONS.map((semester) => {
                  const isActive = semester === selectedSemester;
                  return (
                    <button
                      type="button"
                      key={semester}
                      className={`curriculum-filter-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleSemesterSelect(semester)}
                    >
                      {semester}학기
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="curriculum-summary glass-panel">
              <p className="curriculum-summary-title">
                {selectedGrade}학년 학업 진척도
              </p>
              <ProgressBar current={safeGradeCompletedQuestions} total={safeGradeTotalQuestions} />
              <p className="curriculum-summary-meta">
                {selectedSemester}학기 단원: {semesterCompletedChapters}/{filteredCurriculum.length} 완료
              </p>
              <p className="curriculum-summary-meta">
                학년 전체: {gradeCompletedChapters}/{gradeCurriculum.length} 단원, {safeGradeCompletedQuestions}/{safeGradeTotalQuestions}문항
              </p>
            </div>
            {filteredCurriculum.length === 0 ? (
              <p className="curriculum-empty">해당 학년/학기 조합의 단원이 아직 없습니다.</p>
            ) : null}
            <div className="curriculum-list">
              {filteredCurriculum.map((chapter) => {
                const chapterProgress = progressMap[chapter.id] || {};
                const done = Boolean(chapterProgress.completed);
                const progressText = done
                  ? '완료'
                  : chapterProgress.currentIndex
                    ? `${chapterProgress.currentIndex}/${chapter.questionCount}`
                    : '미시작';

                return (
                  <button
                    type="button"
                    key={chapter.id}
                    className="curriculum-item glass-panel"
                    onClick={() => openTutorial(chapter.id)}
                  >
                    <div className="curriculum-item-top">
                      <span className="curriculum-emoji" aria-hidden="true">
                        {chapter.emoji}
                      </span>
                      <div>
                        <p className="curriculum-title">{chapter.title}</p>
                        <p className="curriculum-subtitle">
                          레벨 {chapter.level} · {chapter.grade}학년 {chapter.semester}학기
                        </p>
                      </div>
                    </div>
                    <p className="curriculum-description">{chapter.description}</p>
                      <p className="curriculum-meta">진행: {progressText}</p>
                    {done ? (
                      <span className="chapter-badge done">🏅 완료</span>
                    ) : null}
                    <span className={`chapter-badge ${done ? 'done' : 'ready'}`}>
                      {done ? '복습하기' : chapterProgress.currentIndex ? '이어하기' : '시작하기'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {viewMode === 'tutorial' && selectedChapter ? (
          <div className="tutorial-wrap">
            <div className="tutorial-card glass-panel">
              <p className="curriculum-title">
                {selectedChapter.emoji} {selectedChapter.title}
              </p>
              <p className="curriculum-subtitle">레벨 {selectedChapter.level}</p>
              <p className="curriculum-description" style={{ marginTop: '0.6rem' }}>
                {selectedChapter.description}
              </p>
              {tutorialSteps.length ? (
                <div className="tutorial-steps">
                  <p className="tutorial-step-meta">
                    개념 가이드 ({Math.min(tutorialStep + 1, tutorialSteps.length)}/{tutorialSteps.length})
                  </p>
                  <p className="tutorial-step-content">{activeTutorialStep}</p>
                  {tutorialSteps.length > 1 ? (
                    <div className="tutorial-step-actions">
                      <button
                        type="button"
                        className="glass-btn secondary-bg"
                        onClick={() => handleTutorialStep(tutorialStep - 1)}
                        disabled={!canPrevStep}
                      >
                        이전
                      </button>
                      <button
                        type="button"
                        className="glass-btn secondary-bg"
                        onClick={() => handleTutorialStep(tutorialStep + 1)}
                        disabled={!canNextStep}
                      >
                        다음
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <ul className="tutorial-points">
                  {selectedChapter.concept.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
              <div className="tutorial-actions">
                <button
                  type="button"
                  className="glass-btn primary-bg"
                  onClick={() => startProblems(hasResumeProgress)}
                >
                  {hasResumeProgress ? '이어 하기' : '시작하기'}
                </button>
                {hasResumeProgress ? (
                  <button
                    type="button"
                    className="glass-btn secondary-bg"
                    onClick={() => startProblems(false)}
                  >
                    처음부터 다시
                  </button>
                ) : null}
                <button type="button" className="glass-btn accent-bg" onClick={goToCurriculumWithSave}>
                  목록으로
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === 'problem' && selectedChapter ? (
          <>
            <div className="math-toolbar">
              <p className="math-label">
                {selectedChapter.title} · {isFinished ? total : index + 1}/{total}
              </p>
              <span className="chapter-chip">{selectedChapter.emoji}</span>
            </div>

            <ProgressBar current={Math.min(index + 1, total)} total={total} />
            <p className="subtitle" style={{ margin: '0.4rem 0 1rem' }}>
              정답 입력 후 Enter를 눌러주세요.
            </p>

            {isFinished ? (
              <div className="result-overlay">
                {showConfetti ? (
                  <div className="confetti-layer" aria-hidden="true">
                    {confettiPieces.map((piece) => (
                      <span
                        key={piece.id}
                        className="confetti-piece"
                        style={{
                          left: piece.left,
                          '--drift-x': piece.driftX,
                          '--duration': piece.duration,
                          '--delay': piece.delay,
                          '--rotation': piece.rotation,
                          width: `${piece.size}px`,
                          height: `${piece.size}px`,
                          borderRadius: piece.borderRadius,
                          backgroundColor: piece.color
                        }}
                      />
                    ))}
                  </div>
                ) : null}
                <div className="result-card glass-panel">
                  <h3 className="result-title">학습 완료!</h3>
                  <p className="result-sub">
                    {score} / {total} 문제 정답
                  </p>
                  <div className="modal-buttons">
                    <button type="button" className="glass-btn primary-bg" onClick={() => startProblems(false)}>
                      다시 시작
                    </button>
                    <button type="button" className="glass-btn secondary-bg" onClick={goToCurriculumWithSave}>
                      단원 목록으로
                    </button>
                    <Link to="/" className="glass-btn accent-bg" style={{ gap: '0.5rem' }}>
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
                  <ProblemRenderer problem={problem} />
                  {isSemiStep ? (
                    <div className="semi-answer-wrap">
                      {placeInputs.map((value, displayIndex) => {
                        const reversedIndex = placeInputs.length - 1 - displayIndex;
                        const guide = getGuideLabel(semiStepGuide, reversedIndex, problem.operator);

                        return (
                          <button
                            key={reversedIndex}
                            type="button"
                            className={`semi-answer-cell ${activePlaceIndex === reversedIndex ? 'active' : ''}`}
                            onClick={() => setActivePlaceIndex(reversedIndex)}
                          >
                            {guide ? (
                              <span className={`semi-step-guide ${guide.type}`}>
                                {guide.text}
                              </span>
                            ) : null}
                            <span className="semi-answer-label">
                              {placeLabel(reversedIndex)}
                            </span>
                            <span className="semi-answer-input">
                              {value || '0'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="answer-shell">
                      <span className={`math-answer ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                        {currentAnswerText}
                      </span>
                    </div>
                  )}
                  <p className={`feedback ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
                    {isCorrect && '정답입니다! ✨'}
                    {isWrong && '조금만 더 생각해볼까요?'}
                  </p>
                  <button
                    type="button"
                    className="glass-btn secondary-bg"
                    onClick={() => setIsHintOpen((prev) => !prev)}
                  >
                    {isHintOpen ? '설명 닫기' : '설명 보기'}
                  </button>
                  {isHintOpen ? (
                    <div className="learning-hint">
                      {selectedChapter.concept.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                      {shouldAutoHint && hintText ? <p className="hint-step">{hintText}</p> : null}
                    </div>
                  ) : null}
                </div>

                <Keypad onKeyPress={handleKeyPress} />
              </>
            )}
          </>
        ) : null}
      </div>
      <Link to="/" className="glass-btn back-btn" style={{ gap: '0.5rem', alignSelf: 'center' }}>
        <ArrowLeft size={20} /> 홈으로
      </Link>
      {viewMode !== 'curriculum' ? (
        <button
          type="button"
          className="glass-btn secondary-bg"
          style={{ marginTop: '0.8rem', alignSelf: 'center' }}
          onClick={goToCurriculumWithSave}
        >
          단원 목록으로
        </button>
      ) : null}
    </div>
  );
};

export default Learning;
