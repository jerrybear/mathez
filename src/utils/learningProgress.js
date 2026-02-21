const STORAGE_KEY = 'mathez_learning_progress';
const STREAK_META_KEY = '__streak_meta__';

const createDateKey = (inputDate) => {
  const source = inputDate ? new Date(inputDate) : new Date();
  if (Number.isNaN(source.getTime())) return '';

  const month = String(source.getMonth() + 1).padStart(2, '0');
  const day = String(source.getDate()).padStart(2, '0');
  return `${source.getFullYear()}-${month}-${day}`;
};

const isSameDate = (a, b) => createDateKey(a) === createDateKey(b);

const isYesterday = (date) => {
  const target = date ? new Date(date) : new Date();
  if (Number.isNaN(target.getTime())) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return isSameDate(target, yesterday);
};

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

const getStreakMeta = (map = {}) => {
  const raw = map[STREAK_META_KEY];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      streak: 0,
      lastCompletedDate: '',
      totalCompletions: 0
    };
  }

  return {
    streak: toPositiveInt(raw.streak, 0),
    lastCompletedDate: typeof raw.lastCompletedDate === 'string' ? raw.lastCompletedDate : '',
    totalCompletions: toPositiveInt(raw.totalCompletions, 0),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()
  };
};

const buildStreakMeta = (prevMeta = {}, currentDate = createDateKey()) => {
  const normalized = getStreakMeta(prevMeta);
  const today = currentDate;
  if (!today || !currentDate) return normalized;
  if (!normalized.lastCompletedDate) {
    return {
      ...normalized,
      streak: 1,
      lastCompletedDate: today,
      totalCompletions: 1,
      updatedAt: new Date().toISOString()
    };
  }

  if (isSameDate(normalized.lastCompletedDate, today)) {
    return {
      ...normalized,
      updatedAt: new Date().toISOString()
    };
  }

  if (isYesterday(normalized.lastCompletedDate)) {
    return {
      ...normalized,
      streak: normalized.streak + 1,
      lastCompletedDate: today,
      totalCompletions: normalized.totalCompletions + 1,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    ...normalized,
    streak: 1,
    lastCompletedDate: today,
    totalCompletions: normalized.totalCompletions + 1,
    updatedAt: new Date().toISOString()
  };
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
  const justCompleted = normalized.completed && !existing.completed;
  if (justCompleted) {
    map[STREAK_META_KEY] = buildStreakMeta(
      getStreakMeta(map),
      createDateKey()
    );
  }

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

export const getLearningStreak = () => {
  const meta = getStreakMeta(getLearningProgressMap());
  return {
    streak: meta.streak,
    lastCompletedDate: meta.lastCompletedDate,
    totalCompletions: meta.totalCompletions
  };
};
