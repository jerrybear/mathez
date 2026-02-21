import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  generateProblem,
  generateRandomProblem,
  getOperationsByLevel,
  generateSimilarProblem
} from '../src/utils/mathEngine.js';

const withMockRandom = (values, fn) => {
  const originalRandom = Math.random;
  let idx = 0;

  Math.random = () => {
    const value = values[idx] ?? 0;
    idx += 1;
    return value;
  };

  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
};

test('level1 operations are limited to + and -', () => {
  const ops = getOperationsByLevel(1);
  assert.deepEqual(new Set(ops), new Set(['+', '-']));
});

test('generateProblem computes addition correctly', () => {
  const result = withMockRandom([0.5, 0.2], () => generateProblem(1, '+'));

  assert.equal(result.operator, '+');
  assert.equal(result.answer, result.num1 + result.num2);
  assert.ok(result.answer >= 0);
});

test('generateProblem computes subtraction correctly', () => {
  const result = withMockRandom([0.9, 0.2], () => generateProblem(1, '-'));

  assert.equal(result.operator, '-');
  assert.equal(result.answer, result.num1 - result.num2);
  assert.ok(result.num1 >= result.num2);
});

test('generateProblem returns integer division answers for level1', () => {
  const result = withMockRandom([0.4, 0.6], () => generateProblem(1, '/'));

  assert.equal(result.operator, '/');
  assert.equal(result.num1 % result.num2, 0);
  assert.equal(result.answer, result.num1 / result.num2);
});

test('generateRandomProblem level3 includes 사칙연산', () => {
  const iterations = 100;
  const operationSet = new Set();

  for (let i = 0; i < iterations; i += 1) {
    operationSet.add(generateRandomProblem(3).operator);
  }

  ['+', '-', '*', '/'].forEach((op) => {
    assert.equal(operationSet.has(op), true);
  });
});

test('generateProblem returns shape visual payload for shape topics', () => {
  const result = withMockRandom(
    [
      0.5, // used for pickRandom in shape target
      0.1, // data for item1
      0.2, // item2
      0.3, // item3
      0.4, // item4
      0.5, // item5
      0.6, // item6
      0.7, // item7
      0.8, // fallback
      0.9 // fallback
    ],
    () => generateProblem(2, '-', { topic: 'shapes', chapterId: 'c07-shape-count', chapterTitle: '여러 가지 모양' })
  );

  assert.equal(result.operator, '-');
  assert.equal(result.topic, 'shapes');
  assert.equal(result.visual.type, 'count-shapes');
  assert.ok(Array.isArray(result.visual.items));
  assert.ok(result.visual.items.length >= 5 && result.visual.items.length <= 10);
  assert.equal(result.visual.answer, result.visual.items.filter((item) => item === result.visual.target).length);
  assert.equal(result.num1, 0);
  assert.equal(result.num2, 0);
});

test('generateProblem returns split-combine visual for level1 addition topics', () => {
  const result = generateProblem(1, '+', {
    topic: 'addition',
    chapterId: 'c01-add-basics',
    chapterTitle: '덧셈'
  });

  assert.equal(result.visual?.type, 'interactive');
  assert.equal(result.visual?.subType, 'split-combine');
  assert.equal(result.visual?.topic, 'addition');
  assert.equal(result.visual?.level, 1);
  assert.equal(result.visual?.totalCount, result.num1 + result.num2);
});

test('c01/c02 level1 basic chapters avoid zero values', () => {
  const c01Addition = generateProblem(1, '+', {
    topic: 'addition',
    chapterId: 'c01-add-basics',
    chapterTitle: '9까지의 수'
  });
  const c02Subtraction = generateProblem(1, '-', {
    topic: 'subtraction',
    chapterId: 'c02-sub-basics',
    chapterTitle: '덧셈과 뺄셈'
  });

  assert.ok(c01Addition.num1 >= 1);
  assert.ok(c01Addition.num2 >= 1);
  assert.ok(c01Addition.num1 + c01Addition.num2 <= 9);
  assert.ok(c02Subtraction.num1 >= 1);
  assert.ok(c02Subtraction.num2 >= 1);
  assert.ok(c02Subtraction.num1 >= c02Subtraction.num2);
});

test('split-combine prompt shows concrete numeric operands', () => {
  const result = generateProblem(1, '+', {
    topic: 'addition',
    chapterId: 'c01-add-basics',
    chapterTitle: '9까지의 수'
  });

  assert.equal(result.visual?.prompt.includes(`${result.num1}과 ${result.num2}를 모으면`), true);
});

test('generateProblem returns base-10 blocks visual for level2 carry/borrow topics', () => {
  const result = generateProblem(2, '+', {
    topic: 'addition-carry',
    chapterId: 'c02-carry',
    chapterTitle: '받아올림'
  });

  assert.equal(result.visual?.type, 'interactive');
  assert.equal(result.visual?.subType, 'base-10-blocks');
  assert.equal(result.visual?.topic, 'addition-carry');
  assert.equal(result.visual?.level, 2);
  assert.equal(result.visual?.tensCount >= 1, true);
  assert.equal(result.visual?.onesCount >= 0, true);
});

test('generateProblem returns clock visual payload for clock topics', () => {
  const result = withMockRandom([0.5], () => generateProblem(1, '+', {
    topic: 'subtraction-borrow',
    chapterId: 'c04-sub-borrow',
    chapterTitle: '시계 보기와 규칙 찾기'
  }));

  assert.equal(result.visual.type, 'clock-reading');
  assert.ok(Number.isFinite(result.visual.time.hour));
  assert.ok(Number.isFinite(result.visual.time.minute));
  assert.equal(result.answer, Number(`${String(result.visual.time.hour).padStart(2, '0')}${String(result.visual.time.minute).padStart(2, '0')}`));
});

test('generateProblem returns clock visual by chapter title keyword', () => {
  const result = withMockRandom([0.2], () => generateProblem(1, '+', {
    topic: 'time-track',
    chapterTitle: '시간과 시각 정리',
    chapterId: 'c99-time'
  }));

  assert.equal(result.visual.type, 'clock-reading');
});

test('generateProblem returns fraction-cuts visual for fraction-decimal level2+', () => {
  const result = withMockRandom([0.1, 0.7], () => generateProblem(2, '+', {
    topic: 'fraction-decimal',
    chapterId: 'c04-fraction',
    chapterTitle: '분수'
  }));

  assert.equal(result.visual?.type, 'interactive');
  assert.equal(result.visual?.subType, 'fraction-cuts');
  assert.equal(result.visual?.topic, 'fraction-decimal');
  assert.equal(result.visual?.level, 2);
  assert.equal(result.visual?.totalSlices >= 2, true);
  assert.equal(result.visual?.denominator, result.visual?.totalSlices);
});

test('generateProblem returns chart visual payload for data topic', () => {
  const result = withMockRandom([0.4, 0.7, 0.2, 0.9, 0.5], () => generateProblem(3, '+', {
    topic: 'data',
    chapterId: 'c15-data-class',
    chapterTitle: '자료의 정리'
  }));

  assert.equal(result.visual.type, 'chart-bar');
  assert.equal(result.visual.data.length >= 2, true);
  assert.equal(result.visual.data.length <= 5, true);

  const values = result.visual.data.map((entry) => Number(entry.value));
  const max = Math.max(...values);
  const sorted = [...result.visual.data].sort((a, b) => b.value - a.value);
  const expected = sorted[0].value - sorted[1].value;

  assert.equal(result.answer, expected);
  assert.equal(max >= 1, true);
  assert.equal(result.visual.question.includes(sorted[0].label), true);
  assert.equal(result.visual.question.includes(sorted[1].label), true);
});

test('generateSimilarProblem regenerates visual problems with same visual topic', () => {
  const wrongProblem = {
    operator: '+',
    topic: 'shapes',
    chapterId: 'c07-shape-count',
    chapterTitle: '여러 가지 모양',
    level: 2,
    visual: {
      type: 'count-shapes',
      target: '🟦',
      items: ['🟦', '🔷', '🟦'],
      answer: 2
    },
    answer: 2
  };

  const next = generateSimilarProblem(wrongProblem);
  assert.equal(next.visual.type, 'count-shapes');
  assert.equal(next.topic, wrongProblem.topic);
  assert.equal(next.chapterId, wrongProblem.chapterId);
  assert.equal(next.chapterTitle, wrongProblem.chapterTitle);
});

test('generateSimilarProblem returns null for invalid operator', () => {
  const next = generateSimilarProblem({
    num1: 1,
    num2: 2,
    operator: 'x',
    level: 1,
    topic: 'addition'
  });

  assert.equal(next, null);
});

test('getOperationsByLevel clamps unsafe levels', () => {
  assert.deepEqual(new Set(getOperationsByLevel(0)), new Set(['+', '-']));
  assert.deepEqual(new Set(getOperationsByLevel(99)), new Set(['+', '-', '*', '/']));
});

test('generateProblem falls back to arithmetic when topic has no visual rule', () => {
  const result = generateProblem(2, '+', {
    topic: 'addition',
    chapterId: 'c-basic',
    chapterTitle: '기본 덧셈'
  });

  assert.equal(result.visual, undefined);
  assert.equal(result.operator, '+');
  assert.equal(result.level, 2);
  assert.equal(result.topic, 'addition');
  assert.equal(result.chapterId, 'c-basic');
  assert.equal(result.chapterTitle, '기본 덧셈');
  assert.equal(result.answer, result.num1 + result.num2);
});

test('generateProblem includes visual for explicit time topic names', () => {
  const result = withMockRandom([0.1, 0.2], () => generateProblem(1, '+', {
    topic: 'time',
    chapterTitle: '시간과 시각',
    chapterId: 'c-time'
  }));

  assert.equal(result.visual?.type, 'clock-reading');
  assert.equal(result.visual?.time?.hour >= 1, true);
  assert.equal(result.visual?.time?.minute >= 0, true);
});

test('generateSimilarProblem for division preserves integer division result', () => {
  const base = {
    num1: 24,
    num2: 4,
    operator: '/',
    level: 2,
    topic: 'addition',
    chapterId: 'c05',
    chapterTitle: '분수'
  };

  const next = generateSimilarProblem(base);

  assert.equal(next.operator, '/');
  assert.equal(next.num1 % next.num2, 0);
  assert.equal(next.answer, next.num1 / next.num2);
});

test('generateProblem returns measurement-length visual payload for measurement topic', () => {
  const leftRandom = (2 - 2) / 8; // 0 => 2
  const rightRandom = (9 - 2) / 8; // 0.875 => 9
  const result = withMockRandom([leftRandom, rightRandom], () => generateProblem(2, '+', {
    topic: 'measurement-length',
    chapterId: 'c11-measure-length',
    chapterTitle: '길이 재기'
  }));

  assert.equal(result.visual.type, 'measurement-length');
  assert.equal(result.num1, 0);
  assert.equal(result.num2, 0);
  assert.equal(result.topic, 'measurement-length');
  assert.ok(Array.isArray(result.visual.items));
  assert.equal(result.visual.items.length, 2);
  assert.equal(result.visual.items.every((entry) => entry.label && Number.isFinite(entry.value)), true);
  assert.equal(result.answer, Math.abs(result.visual.items[0].value - result.visual.items[1].value));
});
