const STORAGE_KEY = 'mathez_wrong_notes';

const readStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    return [];
  }
};

const writeStorage = (list) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    // no-op
  }
};

const normalizeProblem = (problem) => {
  if (!problem || typeof problem !== 'object') return null;

  const {
    id,
    num1,
    num2,
    operator,
    answer,
    level,
    failCount,
    lastAttempt
  } = problem;

  if (![num1, num2, answer].every((value) => Number.isFinite(Number(value)))) return null;
  if (!['+', '-', '*', '/'].includes(operator)) return null;
  if (!Number.isInteger(Number(level))) return null;

  const safeLevel = Math.max(1, Math.min(4, Math.round(Number(level))));
  const now = lastAttempt || new Date().toISOString();

  return {
    id: String(id || Date.now()),
    num1: Number(num1),
    num2: Number(num2),
    operator,
    answer: Number(answer),
    level: safeLevel,
    failCount: Number.isFinite(Number(failCount)) ? Math.max(1, Math.round(Number(failCount))) : 1,
    lastAttempt: now
  };
};

export const saveWrongProblem = (problem) => {
  const next = normalizeProblem(problem);
  if (!next) return readStorage();

  const current = readStorage();
  const idx = current.findIndex((item) => item.num1 === next.num1 && item.num2 === next.num2 && item.operator === next.operator);

  if (idx >= 0) {
    current[idx] = {
      ...current[idx],
      failCount: Number(current[idx].failCount || 0) + 1,
      lastAttempt: next.lastAttempt
    };
  } else {
    current.push({
      ...next,
      failCount: 1,
      lastAttempt: next.lastAttempt,
      answer: next.answer
    });
  }

  writeStorage(current);
  return [...current];
};

export const getWrongProblems = (sortBy = 'latest') => {
  const current = readStorage();

  const sorted = [...current].sort((a, b) => {
    if (sortBy === 'failCount') {
      if ((b.failCount || 0) !== (a.failCount || 0)) {
        return (b.failCount || 0) - (a.failCount || 0);
      }
      return new Date(b.lastAttempt || 0).getTime() - new Date(a.lastAttempt || 0).getTime();
    }

    return new Date(b.lastAttempt || 0).getTime() - new Date(a.lastAttempt || 0).getTime();
  });

  return sorted;
};

export const removeWrongProblem = (id) => {
  const current = readStorage();
  const next = current.filter((item) => String(item.id) !== String(id));

  writeStorage(next);
  return [...next];
};
