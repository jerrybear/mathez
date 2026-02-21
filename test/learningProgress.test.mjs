import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearLearningProgress,
  getLearningProgress,
  getLearningProgressMap,
  getLearningStreak,
  saveLearningProgress
} from '../src/utils/learningProgress.js';

const createStorage = () => {
  const store = Object.create(null);

  return {
    store,
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
    }
  };
};

const resetWindowStorage = () => {
  const storage = createStorage();
  globalThis.window = { localStorage: storage };
  return storage;
};

test('학습 진행도는 저장/조회/클리어가 가능합니다', () => {
  const storage = resetWindowStorage();
  clearLearningProgress();

  const afterSave = saveLearningProgress({
    chapterId: 'addition-2',
    total: 10,
    currentIndex: 3,
    score: 2,
    completed: false
  });

  assert.equal(afterSave['addition-2'].currentIndex, 3);
  assert.equal(afterSave['addition-2'].score, 2);
  assert.equal(getLearningProgress('addition-2').completed, false);
  assert.deepEqual(getLearningProgressMap()['addition-2'], afterSave['addition-2']);

  clearLearningProgress();
  assert.equal(getLearningProgressMap()['addition-2'], undefined);
  assert.equal(storage.getItem('mathez_learning_progress'), '{}');
});

test('완료 처리는 통계 맵에 반영됩니다', () => {
  resetWindowStorage();
  clearLearningProgress();

  const first = saveLearningProgress({
    chapterId: 'addition-2',
    total: 2,
    currentIndex: 2,
    score: 2,
    completed: true
  });

  const second = saveLearningProgress({
    chapterId: 'subtraction-2',
    total: 2,
    currentIndex: 2,
    score: 2,
    completed: true
  });

  const streak = getLearningStreak();
  assert.equal(streak.streak, 1);
  assert.equal(streak.totalCompletions, 1);
  assert.equal(first['__streak_meta__'].streak, 1);
  assert.equal(second['__streak_meta__'].totalCompletions, 1);
  assert.equal(streak.streak, second['__streak_meta__'].streak);
});


test('저장값은 음수/소수 입력도 안전하게 보정됩니다', () => {
  resetWindowStorage();
  clearLearningProgress();

  const saved = saveLearningProgress({
    chapterId: 'mul-1',
    total: -10,
    currentIndex: -3,
    score: 2.8,
    completed: false
  });

  assert.equal(saved['mul-1'].total, 0);
  assert.equal(saved['mul-1'].currentIndex, 0);
  assert.equal(saved['mul-1'].score, 3);
});
