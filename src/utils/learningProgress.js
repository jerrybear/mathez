const STORAGE_KEY = 'mathez_learning_progress';

const readStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
};

const writeStorage = (value) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable or quota exceeded
  }
};

const toPositiveInt = (value, fallback = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.round(number));
};

const normalizePayload = (payload = {}) => {
  const chapterId = String(payload.chapterId || '').trim();
  if (!chapterId) return null;

  return {
    chapterId,
    total: toPositiveInt(payload.total, 0),
    currentIndex: toPositiveInt(payload.currentIndex, 0),
    score: toPositiveInt(payload.score, 0),
    completed: Boolean(payload.completed),
    completedAt: payload.completed ? payload.completedAt || new Date().toISOString() : null,
    updatedAt: payload.updatedAt || new Date().toISOString()
  };
};

export const getLearningProgressMap = () => readStorage();

export const getLearningProgress = (chapterId) => {
  if (!chapterId) return null;
  const map = getLearningProgressMap();
  return map[chapterId] || null;
};

export const saveLearningProgress = (payload = {}) => {
  const normalized = normalizePayload(payload);
  if (!normalized) return getLearningProgressMap();

  const map = getLearningProgressMap();
  const existing = map[normalized.chapterId] || {};
  map[normalized.chapterId] = {
    ...existing,
    ...normalized
  };

  writeStorage(map);
  return map;
};

export const clearLearningProgress = () => {
  writeStorage({});
  return {};
};
