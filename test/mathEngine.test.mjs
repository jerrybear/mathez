import assert from 'node:assert/strict';
import test from 'node:test';
import { generateProblem, generateRandomProblem, getOperationsByLevel } from '../src/utils/mathEngine.js';

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
