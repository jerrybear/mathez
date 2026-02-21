import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  createPlaceInputState,
  initialActivePlaceIndex,
  getSemiStepDisplay,
  toSemiStepValue,
  normalizeIndexInput
} from '../src/utils/semiStepUtils.js';

test('createPlaceInputState creates empty slots for answer digits', () => {
  const state = createPlaceInputState(123);

  assert.deepEqual(state, ['', '', '']);
  assert.equal(initialActivePlaceIndex(123), 2);
});

test('semi step display reverses internal place order to natural reading order', () => {
  assert.equal(getSemiStepDisplay(['', '', '']), '0');
  assert.equal(getSemiStepDisplay(['', '2', '1']), '12');
  assert.equal(getSemiStepDisplay(['3', '2', '1']), '123');
});

test('toSemiStepValue requires all digits and returns reversed numeric value', () => {
  assert.equal(toSemiStepValue(['3', '2', '']), null);
  assert.equal(toSemiStepValue(['3', '2', '1']), 123);
});

test('normalizeIndexInput keeps only one numeric digit', () => {
  assert.equal(normalizeIndexInput('a7b8'), '8');
  assert.equal(normalizeIndexInput(''), '');
});
