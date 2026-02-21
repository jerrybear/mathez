import assert from 'node:assert/strict';
import { test } from 'vitest';
import curriculumCatalog, { getCurriculumById } from '../src/data/curriculum.js';

const inRange = (value, min, max) => value >= min && value <= max;

test('커리큘럼 항목에 학년/학기 메타가 모두 정의됨', () => {
  assert.equal(curriculumCatalog.length > 0, true);

  curriculumCatalog.forEach((chapter) => {
    assert.equal(typeof chapter.id, 'string');
    assert.equal(inRange(Number(chapter.grade), 1, 3), true);
    assert.equal(inRange(Number(chapter.semester), 1, 2), true);
    assert.equal(chapter.questionCount > 0, true);
  });
});

test('학년/학기 필터 기준이 기존 데이터와 일치함', () => {
  const grade1Semester2 = curriculumCatalog.filter((chapter) => chapter.grade === 1 && chapter.semester === 2);
  const grade3Semester2 = curriculumCatalog.filter((chapter) => chapter.grade === 3 && chapter.semester === 2);

  assert.equal(grade1Semester2.length > 0, true);
  assert.equal(grade3Semester2.length > 0, true);
});

test('getCurriculumById는 안전한 문자열 id 조회를 수행함', () => {
  const found = getCurriculumById('c14-circle');
  const notFound = getCurriculumById(null);

  assert.equal(found?.title, '원');
  assert.equal(notFound, undefined);
});
