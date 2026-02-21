export const getDigitsFromNumber = (number) => {
  const normalized = Math.max(0, Math.floor(Math.abs(Number(number) || 0)));
  return String(normalized).split('').reverse();
};

export const isSemiStepCandidate = (chapter, problem) => {
  if (!chapter || !problem) return false;
  if (chapter.level < 2) return false;
  const op = problem.operator;
  if (!Number.isInteger(Number(problem.num1)) || !Number.isInteger(Number(problem.num2)) || !Number.isInteger(Number(problem.answer))) {
    return false;
  }
  const isBigProblem = Math.abs(problem.num1) >= 10 || Math.abs(problem.num2) >= 10;
  const isLongAnswer = getDigitsFromNumber(problem.answer).length > 1;
  if (op === '/' && chapter.level < 4) return false;
  return isBigProblem || isLongAnswer;
};

export const normalizeIndexInput = (value) => {
  const next = String(value).replace(/[^0-9]/g, '');
  return next.slice(-1);
};

export const createPlaceInputState = (answer) => {
  const answerDigits = getDigitsFromNumber(answer);
  return Array.from({ length: answerDigits.length || 1 }, () => '');
};

export const initialActivePlaceIndex = (answer) => {
  const answerDigits = getDigitsFromNumber(answer);
  return Math.max(0, answerDigits.length - 1);
};

export const getSemiStepDisplay = (placeInputs) => {
  const digits = [...placeInputs].reverse();
  const text = digits.join('');
  return text || '0';
};

export const toSemiStepValue = (placeInputs) => {
  if (!placeInputs.length) return null;
  if (placeInputs.some((value) => value === '')) return null;

  const value = [...placeInputs].reverse().join('');
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const nextSemiStepActiveIndex = (activeIndex) => Math.max(activeIndex - 1, 0);
