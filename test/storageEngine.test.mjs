import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getWrongProblems,
  removeWrongProblem,
  saveWrongProblem
} from '../src/utils/storageEngine.js';

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
  storage.clear();
  return storage;
};

test('saveWrongProblem는 동일 문제를 다시 저장하면 failCount를 누적합니다', () => {
  resetWindowStorage();

  const first = saveWrongProblem({
    id: 'x-1',
    num1: 12,
    num2: 5,
    operator: '*',
    answer: 60,
    level: 3
  });

  assert.equal(first.length, 1);
  assert.equal(first[0].failCount, 1);

  const second = saveWrongProblem({
    id: 'x-1',
    num1: 12,
    num2: 5,
    operator: '*',
    answer: 60,
    level: 3
  });

  assert.equal(second.length, 1);
  assert.equal(second[0].failCount, 2);
});

test('getWrongProblems 정렬 기준이 최신순/실패횟수 순으로 동작합니다', () => {
  resetWindowStorage();

  saveWrongProblem({
    id: 'newer',
    num1: 5,
    num2: 7,
    operator: '+',
    answer: 12,
    level: 2
  });

  saveWrongProblem({
    id: 'older',
    num1: 7,
    num2: 2,
    operator: '+',
    answer: 9,
    level: 2
  });

  saveWrongProblem({
    id: 'newer',
    num1: 5,
    num2: 7,
    operator: '+',
    answer: 12,
    level: 2
  });

  const latest = getWrongProblems('latest');
  assert.equal(latest[0].num1, 5);
  assert.equal(latest[0].num2, 7);
  assert.equal(latest[0].failCount, 2);

  saveWrongProblem({
    id: 'single',
    num1: 9,
    num2: 1,
    operator: '-',
    answer: 8,
    level: 1,
  });

  saveWrongProblem({
    id: 'single',
    num1: 9,
    num2: 1,
    operator: '-',
    answer: 8,
    level: 1,
  });

  const byFail = getWrongProblems('failCount');
  assert.equal(byFail[0].num1, 9);
  assert.equal(byFail[0].failCount, 2);
});

test('removeWrongProblem는 id 기준으로 문제를 안전하게 삭제합니다', () => {
  resetWindowStorage();

  const first = saveWrongProblem({
    id: 't-1',
    num1: 4,
    num2: 4,
    operator: '+',
    answer: 8,
    level: 1
  });

  const remaining = removeWrongProblem(first[0].id);
  assert.equal(remaining.length, 0);

  const emptyAgain = removeWrongProblem('nope');
  assert.equal(emptyAgain.length, 0);
});
