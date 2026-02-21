import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPlaceInputState,
  isSemiStepCandidate,
  initialActivePlaceIndex,
  normalizeIndexInput,
  nextSemiStepActiveIndex,
  toSemiStepValue,
  getDigitsFromNumber,
  getSemiStepDisplay
} from '../src/utils/semiStepUtils.js';

test('12 x 5 같은 2자리 정답은 십의 자리 우선 입력으로 60이 됩니다', () => {
  const placeInputs = createPlaceInputState(60);
  let activeIndex = initialActivePlaceIndex(60);
  const current = [...placeInputs];

  current[activeIndex] = normalizeIndexInput(6);
  activeIndex = nextSemiStepActiveIndex(activeIndex);
  current[activeIndex] = normalizeIndexInput(0);

  assert.equal(activeIndex, 0);
  assert.equal(toSemiStepValue(current), 60);
  assert.equal(getSemiStepDisplay(current), '60');
});

test('일의 자리부터 입력하면 자리 합성이 반대로 합성되어 오답이 될 수 있음', () => {
  const wrongOrdered = ['6', '0'];

  assert.equal(toSemiStepValue(wrongOrdered), 6);
  assert.equal(getSemiStepDisplay(wrongOrdered), '06');
});

test('빈 자릿수가 하나라도 있으면 채점 불가로 처리해야 합니다', () => {
  const partial = ['6', ''];

  assert.equal(toSemiStepValue(partial), null);
});

test('초기 활성 위치는 정답의 최고 자릿수 인덱스여야 합니다', () => {
  assert.equal(initialActivePlaceIndex(60), 1);
  assert.equal(initialActivePlaceIndex(5), 0);
  assert.equal(createPlaceInputState(5).length, 1);
  assert.equal(createPlaceInputState(60).length, 2);
});

test('자릿수 분리 유틸은 60을 0,6으로 보관하고, 역순 조합으로 60을 만들어야 합니다', () => {
  const digits = getDigitsFromNumber(60);
  assert.deepEqual(digits, ['0', '6']);
});

test('학습 세부 입력 모드 진입 조건을 검사합니다', () => {
  const chapterLevel2 = { level: 2, operations: ['+'] };
  const chapterLevel1 = { level: 1, operations: ['+'] };
  const chapterLevel4Div = { level: 4, operations: ['/'] };

  assert.equal(isSemiStepCandidate(chapterLevel1, { num1: 15, num2: 20, answer: 35, operator: '+' }), false);
  assert.equal(isSemiStepCandidate(chapterLevel2, { num1: 15, num2: 3, answer: 18, operator: '+' }), true);
  assert.equal(isSemiStepCandidate(chapterLevel2, { num1: 3, num2: 6, answer: 18, operator: '+' }), true);
  assert.equal(isSemiStepCandidate({ level: 3, operations: ['/'] }, { num1: 12, num2: 3, answer: 4, operator: '/' }), false);
  assert.equal(isSemiStepCandidate(chapterLevel4Div, { num1: 2, num2: 1, answer: 2, operator: '/' }), false);
  assert.equal(isSemiStepCandidate(chapterLevel4Div, { num1: 12, num2: 3, answer: 4, operator: '/' }), true);
});
