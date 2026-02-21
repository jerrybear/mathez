const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const toSeedNumber = (raw) => {
  const source = String(raw ?? '');
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash >>>= 0;
    hash *= 16777619;
    hash >>>= 0;
  }
  return hash >>> 0;
};

const roundToDecimal = (value, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const clampLevel = (level) => {
  const parsed = Number(level);
  if (!Number.isFinite(parsed)) return 1;
  if (parsed < 1) return 1;
  if (parsed > 4) return 4;
  return Math.round(parsed);
};

export const getOperationsByLevel = (level) => {
  const safeLevel = clampLevel(level);

  switch (safeLevel) {
    case 1:
      return ['+', '-'];
    case 2:
      return ['+', '-', '*'];
    case 3:
    case 4:
    default:
      return ['+', '-', '*', '/'];
  }
};

const isThreeDigitTopic = (topic) => topic === 'three-digit';
const isFourDigitTopic = (topic) => topic === 'four-digit';
const isFractionOrDecimalTopic = (topic) => topic === 'fraction-decimal';
const isShapeTopic = (topic) => ['shapes', 'geometry-figures', 'circle'].includes(topic);
const isCompareTopic = (topic) => topic === 'compare';
const isMeasurementLengthTopic = (topic) => topic === 'measurement-length';
const isDataTopic = (topic) => topic === 'data';
const isNumberBasicsTopic = (topic) => String(topic || '') === 'number-basics';
const isOperationsBasicsTopic = (topic) => String(topic || '') === 'operations-basics';
const isClockTopic = (topic, title = '') => {
  const normalized = String(topic || '').toLowerCase();
  const normalizedTitle = String(title || '').toLowerCase();
  return normalized === 'clock-reading'
    || normalized === 'time'
    || normalized === 'clock'
    || normalized === 'time-track'
    || normalized === 'clockreading'
    || normalized === 'subtraction-borrow'
    || normalizedTitle.includes('시계')
    || normalizedTitle.includes('시각')
    || normalizedTitle.includes('시간');
};

const isAdditionTopic = (topic) => String(topic || '') === 'addition';
const isSubtractionTopic = (topic) => String(topic || '') === 'subtraction';
const isBorrowTopic = (topic) => String(topic || '') === 'subtraction-borrow';
const isCarryTopic = (topic) => String(topic || '') === 'addition-carry';
const isBasicLevel1Chapter = (chapterId = '') => {
  const normalizedChapterId = String(chapterId || '').toLowerCase();
  return normalizedChapterId.startsWith('c01') || normalizedChapterId.startsWith('c02');
};
const NUMBER_BASICS_MODE_INDEX = {
  counting: 0,
  zero: 1,
  sequence: 2,
  compare: 3,
  'split-combine': 4
};

const shouldUseSplitCombine = (topic, operation, level) => (
  (isAdditionTopic(topic) || isSubtractionTopic(topic) || isNumberBasicsTopic(topic) || isOperationsBasicsTopic(topic))
  && ['+', '-'].includes(String(operation || ''))
  && clampLevel(level) === 1
);

const shouldUseBase10Blocks = (topic, level) => (
  level === 2 && (isBorrowTopic(topic) || isCarryTopic(topic))
);

const shouldUseFractionCuts = (topic, level) => (
  String(topic || '') === 'fraction-decimal' && level >= 2
);

const normalizeVisualSeed = (value) => Math.max(1, Math.round(Number(value) || 0));

const topicHasVisualSupport = (topic, chapterTitle = '') => [
  isShapeTopic(topic),
  isCompareTopic(topic),
  isMeasurementLengthTopic(topic),
  isClockTopic(topic, chapterTitle),
  isDataTopic(topic)
].some(Boolean);

const pickRandom = (items) => items[randomInt(0, items.length - 1)];

const generateAdditionProblem = (level, topic = '', chapterId = '') => {
  const safeLevel = clampLevel(level);
  const normalizedTopic = String(topic || '');
  const isBasicChapter = safeLevel === 1 && isBasicLevel1Chapter(chapterId);
  const minValue = isBasicChapter ? 1 : 0;

  if (safeLevel === 1) {
    for (let i = 0; i < 100; i += 1) {
      const num1 = randomInt(minValue, 9);
      const num2 = randomInt(minValue, 9);
      if (num1 + num2 <= 9) {
        return { num1, num2 };
      }
    }
    return { num1: minValue || 4, num2: isBasicChapter ? 3 : 4 };
  }

  if (safeLevel === 2) {
    if (normalizedTopic === 'addition-carry') {
      for (let i = 0; i < 100; i += 1) {
        const num1 = randomInt(10, 89);
        const num2 = randomInt(1, 89);
        if ((num1 % 10) + (num2 % 10) >= 10) {
          return { num1, num2 };
        }
      }
      return { num1: 48, num2: 7 };
    }

    if (isThreeDigitTopic(normalizedTopic)) {
      for (let i = 0; i < 140; i += 1) {
        const num1 = randomInt(100, 999);
        const num2 = randomInt(100, 999);
        if ((num1 % 10) + (num2 % 10) >= 10) {
          return { num1, num2 };
        }
      }
      return { num1: 123, num2: 298 };
    }

    for (let i = 0; i < 100; i += 1) {
      const num1 = randomInt(10, 89);
      const num2 = randomInt(1, 89);
      if ((num1 % 10) + (num2 % 10) >= 10) {
        return { num1, num2 };
      }
    }
    return { num1: 48, num2: 7 };
  }

  if (safeLevel === 3) {
    if (isFourDigitTopic(normalizedTopic)) {
      return {
        num1: randomInt(1200, 5999),
        num2: randomInt(300, 1200)
      };
    }

    if (isFractionOrDecimalTopic(normalizedTopic)) {
      const num1 = roundToDecimal(randomInt(0, 90) / 10, 1);
      const num2 = roundToDecimal(randomInt(0, 90) / 10, 1);
      return { num1, num2 };
    }

    return {
      num1: randomInt(12, 300),
      num2: randomInt(8, 100)
    };
  }

  return {
    num1: randomInt(100, 999),
    num2: randomInt(100, 999)
  };
};

const generateSubtractionProblem = (level, topic = '', chapterId = '') => {
  const safeLevel = clampLevel(level);
  const normalizedTopic = String(topic || '');
  const isBasicChapter = safeLevel === 1 && isBasicLevel1Chapter(chapterId);
  const minValue = isBasicChapter ? 1 : 0;

  if (safeLevel === 1) {
    for (let i = 0; i < 100; i += 1) {
      const num1 = randomInt(minValue, 9);
      const num2 = randomInt(minValue, 9);
      if (num1 >= num2) {
        return { num1, num2 };
      }
    }
    return { num1: isBasicChapter ? 3 : 7, num2: isBasicChapter ? 1 : 3 };
  }

  if (safeLevel === 2) {
    if (isThreeDigitTopic(normalizedTopic)) {
      const num1 = randomInt(100, 999);
      const num2 = randomInt(10, num1);
      return { num1, num2 };
    }

    if (normalizedTopic === 'subtraction-borrow') {
      for (let i = 0; i < 100; i += 1) {
        const num1 = randomInt(10, 90);
        const num2 = randomInt(0, 90);
        if (num1 >= num2 && (num1 % 10) < (num2 % 10)) {
          return { num1, num2 };
        }
      }
      return { num1: 62, num2: 18 };
    }

    for (let i = 0; i < 100; i += 1) {
      const num1 = randomInt(10, 90);
      const num2 = randomInt(0, 90);
      if (num1 >= num2 && (num1 % 10) < (num2 % 10)) {
        return { num1, num2 };
      }
    }
    return { num1: 62, num2: 18 };
  }

  if (safeLevel === 3) {
    if (isFourDigitTopic(normalizedTopic)) {
      const num1 = randomInt(1000, 9999);
      const num2 = randomInt(100, num1);
      return { num1, num2 };
    }

    if (isFractionOrDecimalTopic(normalizedTopic)) {
      const num1 = roundToDecimal(randomInt(0, 240) / 10, 1);
      const num2 = roundToDecimal(randomInt(0, 240) / 10, 1);
      if (num1 >= num2) return { num1, num2 };
      return { num1: num2, num2: num1 };
    }

    const num1 = randomInt(20, 500);
    const num2 = randomInt(1, num1);
    return { num1, num2 };
  }

  for (let i = 0; i < 100; i += 1) {
    const num1 = randomInt(100, 900);
    const num2 = randomInt(50, 899);
    if (num1 >= num2) {
      return { num1, num2 };
    }
  }

  return { num1: 800, num2: 600 };
};

const generateMultiplicationProblem = (level, topic = '') => {
  const safeLevel = clampLevel(level);
  const normalizedTopic = String(topic || '');

  if (safeLevel === 1) {
    return {
      num1: randomInt(0, 5),
      num2: randomInt(0, 5)
    };
  }

  if (safeLevel === 2) {
    return {
      num1: randomInt(2, 9),
      num2: randomInt(2, 9)
    };
  }

  if (safeLevel === 3) {
    if (isFractionOrDecimalTopic(normalizedTopic)) {
      return {
        num1: roundToDecimal(randomInt(10, 90) / 10, 1),
        num2: randomInt(1, 9)
      };
    }

    return {
      num1: randomInt(2, 12),
      num2: randomInt(1, 9)
    };
  }

  return {
    num1: randomInt(3, 18),
    num2: randomInt(3, 15)
  };
};

const generateDivisionProblem = (level, topic = '') => {
  const safeLevel = clampLevel(level);
  const normalizedTopic = String(topic || '');

  if (safeLevel === 1) {
    const num2 = randomInt(1, 9);
    const answer = randomInt(1, 9);
    return { num1: num2 * answer, num2, answer };
  }

  if (safeLevel === 2) {
    if (isFractionOrDecimalTopic(normalizedTopic)) {
      const num2 = randomInt(2, 9);
      const answer = randomInt(1, 10);
      return {
        num1: num2 * answer,
        num2,
        answer
      };
    }

    const num2 = randomInt(2, 9);
    const answer = randomInt(2, 20);
    return { num1: num2 * answer, num2, answer };
  }

  if (safeLevel === 3) {
    const num2 = randomInt(2, 12);
    const answer = randomInt(1, 30);
    return { num1: num2 * answer, num2, answer };
  }

  const num2 = randomInt(2, 12);
  const answer = randomInt(2, 50);
  return { num1: num2 * answer, num2, answer };
};

const buildShapeVisual = () => {
  const shapes = ['🔺', '🟦', '🟡', '🟩', '◼️', '🟣', '🔷'];
  const itemCount = randomInt(5, 10);
  const target = pickRandom(shapes);
  const items = Array.from({ length: itemCount }, () => pickRandom(shapes));

  const answer = items.filter((item) => item === target).length;
  return {
    type: 'count-shapes',
    target,
    items,
    layout: 'random',
    answer
  };
};

const buildClockVisual = () => {
  const hour = randomInt(1, 12);
  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const minute = pickRandom(minuteOptions);

  const answer = Number(String(hour).padStart(2, '0') + String(minute).padStart(2, '0'));
  return {
    type: 'clock-reading',
    time: { hour, minute },
    answer
  };
};

const buildDataVisual = () => {
  const labels = ['🍎', '🍊', '🍌', '🍇', '🍑'];
  const count = randomInt(2, 5);
  const selected = [...labels].sort(() => Math.random() - 0.5).slice(0, count);
  const data = selected.map((label) => ({
    label,
    value: randomInt(1, 7)
  }));
  for (let i = 0; i < 10; i += 1) {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    if (sorted.length >= 2 && sorted[0].value > sorted[1].value) {
      break;
    }
    const targetIndex = data.findIndex((entry) => entry.label === sorted[1].label);
    if (targetIndex >= 0) {
      data[targetIndex].value = Math.max(0, data[targetIndex].value - 1);
    }
  }

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const question = `${sorted[0].label}는 ${sorted[1].label}보다 몇 개 더 많나요?`;
  const answer = sorted[0].value - sorted[1].value;

  return {
    type: 'chart-bar',
    data,
    question,
    answer
  };
};

const buildMeasurementVisual = () => {
  const left = {
    label: '연필',
    value: randomInt(2, 9)
  };
  const right = {
    label: '지우개',
    value: randomInt(2, 9)
  };
  if (left.value === right.value) {
    right.value = left.value > 4 ? left.value - 1 : left.value + 1;
  }

  const isLeftLonger = left.value > right.value;
  const longerItem = isLeftLonger ? left : right;
  const shorterItem = isLeftLonger ? right : left;
  const question = `${longerItem.label}은(는) ${shorterItem.label}보다 얼마나 더 긴가요?`;

  return {
    type: 'measurement-length',
    items: [left, right],
    question,
    answer: Math.abs(left.value - right.value)
  };
};

const buildCountingVisual = () => {
  const shapes = ['🍎', '🍌', '🍓', '🍇', '🍊', '🍋', '🍒', '🍐'];
  const itemCount = randomInt(1, 9);
  const target = pickRandom(shapes);
  const items = Array.from({ length: itemCount }, () => pickRandom(shapes));

  let answer = items.filter((item) => item === target).length;
  if (answer === 0) {
    items[0] = target;
    answer = 1;
  }

  return {
    type: 'count-shapes',
    target,
    items,
    layout: 'ordered',
    answer,
    prompt: '1~9 사이 개수를 세보세요.'
  };
};

const buildZeroVisual = () => ({
  type: 'zero-concept',
  count: 0,
  prompt: '빈 접시에 사과가 몇 개 있나요?'
});

const buildSequenceVisual = () => {
  const sequenceLabels = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];
  const mode = randomInt(0, 2);

  if (mode === 0) {
    const base = randomInt(1, 8);
    return {
      type: 'sequence',
      prompt: `${base}의 다음 수는?`,
      answer: base + 1,
      number: base,
      mode: 'next'
    };
  }

  if (mode === 1) {
    const base = randomInt(2, 9);
    return {
      type: 'sequence',
      prompt: `${base}의 이전 수는?`,
      answer: base - 1,
      number: base,
      mode: 'previous'
    };
  }

  const index = randomInt(1, 9);
  return {
    type: 'sequence',
    prompt: `${sequenceLabels[index - 1]}는 몇 번째 수일까요?`,
    answer: index,
    ordinalIndex: index
  };
};

const buildComparisonVisual = () => {
  const leftCount = randomInt(1, 9);
  const rightCount = randomInt(1, 9);
  if (leftCount === rightCount) {
    return buildComparisonVisual();
  }

  return {
    type: 'compare',
    left: { label: '🍎', count: leftCount },
    right: { label: '🍊', count: rightCount },
    question: `🍎와 🍊의 개수를 보고 더 많은 쪽이 몇 개 더 많은지 구하세요.`,
    answer: Math.abs(leftCount - rightCount)
  };
};

const buildSplitCombineNumberBasicsVisual = (operation = '+', num1 = 0, num2 = 0) => {
  const safeNum1 = Math.max(0, Math.round(num1));
  const safeNum2 = Math.max(0, Math.round(num2));
  return buildSplitCombineVisual('number-basics', 1, operation, safeNum1, safeNum2, randomInt(100, 999));
};

const generateNumberBasicsProblem = (level = 1, operation = '+', options = {}) => {
  const safeLevel = clampLevel(level);
  const safeOperation = String(operation || '+');
  const forcedMode = String(options?.numberBasicsMode || '').trim();

  if (safeLevel !== 1) {
    return safeOperation === '-'
      ? generateSubtractionProblem(safeLevel, 'number-basics', 'c01-number-basics')
      : generateAdditionProblem(safeLevel, 'number-basics', 'c01-number-basics');
  }

  const forcedModeIndex = Object.prototype.hasOwnProperty.call(NUMBER_BASICS_MODE_INDEX, forcedMode)
    ? NUMBER_BASICS_MODE_INDEX[forcedMode]
    : -1;
  const mode = forcedModeIndex >= 0 ? forcedModeIndex : randomInt(0, 4);

  if (mode === 0) {
    const visual = buildCountingVisual();
    return {
      num1: 0,
      num2: 0,
      answer: visual.answer,
      visual
    };
  }

  if (mode === 1) {
    const visual = buildZeroVisual();
    return {
      num1: 0,
      num2: 0,
      answer: 0,
      visual
    };
  }

  if (mode === 2) {
    const visual = buildSequenceVisual();
    return {
      num1: visual.answer,
      num2: 0,
      answer: visual.answer,
      visual
    };
  }

  if (mode === 3) {
    const visual = buildComparisonVisual();
    return {
      num1: 0,
      num2: 0,
      answer: visual.answer,
      visual
    };
  }

  if (safeOperation === '-') {
    const num1 = randomInt(1, 8);
    const num2 = randomInt(0, num1);
    return {
      num1,
      num2,
      answer: num1 - num2,
      visual: buildSplitCombineNumberBasicsVisual('-', num1, num2)
    };
  }

  const num1 = randomInt(1, 4);
  const num2 = randomInt(1, 9 - num1);
  return {
    num1,
    num2,
    answer: num1 + num2,
    visual: buildSplitCombineNumberBasicsVisual('+', num1, num2)
  };
};

const buildSplitCombineVisual = (topic = '', level = 1, operation = '+', num1 = 0, num2 = 0, seed = '') => {
  const safeLevel = clampLevel(level);
  const safeOperation = String(operation || '+');
  const normalizedTopic = String(topic || '');
  const safeNum1 = Number.isFinite(num1) ? Math.max(0, Math.round(num1)) : 0;
  const safeNum2 = Number.isFinite(num2) ? Math.max(0, Math.round(num2)) : 0;
  const totalCount = safeOperation === '-'
    ? normalizeVisualSeed(safeNum1)
    : normalizeVisualSeed(safeNum1 + safeNum2);

  return {
    type: 'interactive',
    subType: 'split-combine',
    operation: safeOperation,
    topic: normalizedTopic,
    level: safeLevel,
    target: '🍎',
    totalCount: Math.max(2, Math.min(24, Math.max(totalCount, 2))),
    leftAmount: safeNum1,
    rightAmount: safeNum2,
    prompt: safeOperation === '-'
      ? `${safeNum1}에서 ${safeNum2}를 빼면 몇 개가 남을까요?`
      : `${safeNum1}과 ${safeNum2}를 모으면 몇 개가 될까요?`,
    seed: String(seed || ''),
    isInteractive: true
  };
};

const buildBase10BlocksVisual = (topic = '', level = 1, operation = '+', num1 = 0, num2 = 0, seed = '') => {
  const safeLevel = clampLevel(level);
  const safeOperation = String(operation || '+');
  const leftTens = Math.floor(Math.max(0, normalizeVisualSeed(num1)) / 10);
  const leftOnes = Math.max(0, normalizeVisualSeed(num1)) % 10;
  const rightTens = Math.floor(Math.max(0, normalizeVisualSeed(num2)) / 10);
  const rightOnes = Math.max(0, normalizeVisualSeed(num2)) % 10;

  return {
    type: 'interactive',
    subType: 'base-10-blocks',
    operation: safeOperation,
    topic: String(topic || ''),
    level: safeLevel,
    tensCount: Math.max(1, leftTens + rightTens),
    onesCount: leftOnes + rightOnes,
    left: { tens: leftTens, ones: leftOnes },
    right: { tens: rightTens, ones: rightOnes },
    isBorrowMode: String(topic || '') === 'subtraction-borrow',
    isCarryMode: String(topic || '') === 'addition-carry',
    prompt: safeOperation === '-'
      ? '십의 자리 막대를 눌러 일의 자리로 분해해보면 받아내림이 자연스럽게 보여요.'
      : '일 모형이 10개가 되면 십으로 다시 모아보는 흐름을 연습해요.',
    seed: String(seed || ''),
    isInteractive: true
  };
};

const buildFractionVisual = (topic = '', level = 1, operation = '+', answer = 0, seed = '') => {
  const safeLevel = clampLevel(level);
  const safeOperation = String(operation || '+');
  const safeAnswer = Number.isFinite(answer) ? Math.abs(Number(answer)) : 0;
  const denominator = Math.max(2, Math.min(10, 2 + Math.floor((safeAnswer * 10) % 8)));
  const numerator = Math.max(
    1,
    Math.min(denominator - 1, Math.floor((safeAnswer * denominator) % denominator) || 1)
  );

  return {
    type: 'interactive',
    subType: 'fraction-cuts',
    operation: safeOperation,
    topic: String(topic || ''),
    level: safeLevel,
    totalSlices: denominator,
    denominator,
    coloredCount: numerator,
    prompt: `총 ${denominator}조각 중 ${numerator}조각을 색칠해보세요.`,
    seed: String(seed || ''),
    isInteractive: true
  };
};

const buildVisualProblem = (topic = '', title = '', operation = '+', level = 1, num1 = 0, num2 = 0, answer = 0, seed = '') => {
  const shapeTopic = isShapeTopic(topic);
  const compareTopic = isCompareTopic(topic);
  const measurementTopic = isMeasurementLengthTopic(topic);
  const clockTopic = isClockTopic(topic, title);
  const dataTopic = isDataTopic(topic);
  const hasVisual = topicHasVisualSupport(topic, title);
  const safeLevel = clampLevel(level);
  const safeOperation = String(operation || '+');
  const normalizedTopic = String(topic || '');

  if (shouldUseSplitCombine(normalizedTopic, safeOperation, safeLevel)) {
    return buildSplitCombineVisual(topic, safeLevel, safeOperation, num1, num2, seed);
  }

  if (shouldUseBase10Blocks(normalizedTopic, safeLevel)) {
    return buildBase10BlocksVisual(topic, safeLevel, safeOperation, num1, num2, seed);
  }

  if (shouldUseFractionCuts(normalizedTopic, safeLevel)) {
    return buildFractionVisual(topic, safeLevel, safeOperation, answer, seed);
  }

  if (!hasVisual) return null;

  if (shapeTopic || dataTopic || clockTopic || compareTopic || measurementTopic) {
    const visual = compareTopic ? buildDataVisual()
      : measurementTopic ? buildMeasurementVisual()
        : shapeTopic ? buildShapeVisual()
          : clockTopic ? buildClockVisual()
            : buildDataVisual();

    const answer = visual.answer;

    return {
      num1: 0,
      num2: 0,
      operator: operation,
      answer,
      visual
    };
  }

  return null;
};

const makeProblemSeed = ({
  level = 1,
  operation = '+',
  topic = '',
  chapterId = '',
  chapterTitle = '',
  num1 = 0,
  num2 = 0,
  answer = 0
}) => {
  return toSeedNumber(`v2-${level}-${operation}-${topic}-${chapterId}-${chapterTitle}-${num1}-${num2}-${answer}-${Date.now()}-${randomInt(1000, 999999)}`);
};

export const generateProblem = (level = 1, operation = '+', options = {}) => {
  const safeLevel = clampLevel(level);
  const safeOp = ['+', '-', '*', '/'].includes(operation) ? operation : '+';
  const topic = String(options?.topic || '');
  const chapterTitle = String(options?.chapterTitle || '');
  const chapterId = String(options?.chapterId || '');
  const isLevel1C01 = safeLevel === 1 && chapterId.toLowerCase().startsWith('c01');
  const isNumberBasics = isNumberBasicsTopic(topic) || isLevel1C01;

  const operationGenerators = {
    '+': generateAdditionProblem,
    '-': generateSubtractionProblem,
    '*': generateMultiplicationProblem,
    '/': generateDivisionProblem
  };

  const generated = isNumberBasics
    ? generateNumberBasicsProblem(safeLevel, safeOp, { numberBasicsMode: options?.numberBasicsMode })
    : operationGenerators[safeOp](safeLevel, topic, chapterId);
  const { num1 = 0, num2 = 0, answer: explicitAnswer } = generated || {};

  let answer = 0;
  switch (safeOp) {
    case '+':
      answer = num1 + num2;
      break;
    case '-':
      answer = num1 - num2;
      break;
    case '*':
      answer = num1 * num2;
      break;
    case '/':
      answer = num2 === 0 ? 0 : num1 / num2;
      break;
    default:
      answer = num1 + num2;
      break;
  }

  const fixedAnswer = Number.isFinite(explicitAnswer) ? explicitAnswer : answer;
  const problemSeed = makeProblemSeed({
    level: safeLevel,
    operation: safeOp,
    topic,
    chapterId: String(options?.chapterId || ''),
    chapterTitle,
    num1,
    num2,
    answer: fixedAnswer
  });
  const visualBuild = isNumberBasics && generated?.visual
    ? generated.visual
    : buildVisualProblem(topic, chapterTitle, safeOp, safeLevel, num1, num2, fixedAnswer, problemSeed);
  const visual = visualBuild?.visual || visualBuild;
  const finalNum1 = Number.isFinite(visualBuild?.num1) ? visualBuild.num1 : num1;
  const finalNum2 = Number.isFinite(visualBuild?.num2) ? visualBuild.num2 : num2;
  const finalAnswer = Number.isFinite(visual?.answer)
    ? visual.answer
    : (isFractionOrDecimalTopic(topic) ? roundToDecimal(fixedAnswer, 1) : fixedAnswer);

  return {
    num1: finalNum1,
    num2: finalNum2,
    operator: safeOp,
    answer: finalAnswer,
    seed: String(problemSeed),
    level: safeLevel,
    topic,
    chapterTitle,
    chapterId: String(options?.chapterId || ''),
    ...(visual ? { visual } : {})
  };
};

export const generateRandomProblem = (level = 1) => {
  const safeLevel = clampLevel(level);
  const operations = getOperationsByLevel(safeLevel);
  const operation = operations[randomInt(0, operations.length - 1)];
  return generateProblem(safeLevel, operation);
};

export const generateSimilarProblem = (wrongProblem) => {
  if (!wrongProblem || typeof wrongProblem !== 'object') return null;

  if (wrongProblem.visual && wrongProblem.topic) {
    return generateProblem(wrongProblem.level, wrongProblem.operator, {
      topic: wrongProblem.topic,
      chapterId: wrongProblem.chapterId || '',
      chapterTitle: wrongProblem.chapterTitle || ''
    });
  }

  const { num1, num2, operator, level, topic = '', chapterTitle = '' } = wrongProblem;
  const safeNum1 = Number(num1);
  const safeNum2 = Number(num2);
  const safeLevel = clampLevel(level);
  const normalizedTopic = String(topic || '');
  const isDecimalTopic = isFractionOrDecimalTopic(normalizedTopic)
    || !Number.isInteger(safeNum1)
    || !Number.isInteger(safeNum2);

  if (!Number.isFinite(safeNum1) || !Number.isFinite(safeNum2) || !['+', '-', '*', '/'].includes(operator)) {
    return null;
  }

  const base = Math.max(1, Math.max(Math.abs(safeNum1), Math.abs(safeNum2)));
  const minDelta = Math.max(1, Math.floor(base * 0.1));
  const maxDelta = Math.max(minDelta, Math.floor(base * 0.2));
  const clampPositiveInteger = (value) => Math.max(0, Math.round(value));
  const clampDecimal = (value) => roundToDecimal(Math.max(0, value), 1);

  const mutateNumber = (value) => {
    if (isDecimalTopic) {
      const delta = randomInt(1, 5) / 10;
      return clampDecimal(
        value + (Math.random() < 0.5 ? -delta : delta)
      );
    }

    const delta = randomInt(minDelta, maxDelta);
    return clampPositiveInteger(
      value + (Math.random() < 0.5 ? -delta : delta)
    );
  };

  const mutateLastDigit = (value) => {
    if (isDecimalTopic) {
      const delta = Math.random() < 0.5 ? 0.1 : -0.1;
      return clampDecimal(value + delta);
    }

    const tens = Math.floor(value / 10) * 10;
    const next = tens + randomInt(0, 9);
    if (next === value) return value + 1;
    return clampPositiveInteger(next);
  };

  const computeAnswer = (a, b, op) => {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    return 0;
  };

  const triesLimit = 40;
  for (let tries = 0; tries < triesLimit; tries += 1) {
    const mutateByLastDigit = Math.random() < 0.4;
    const mutatedNum1 = mutateByLastDigit ? mutateLastDigit(safeNum1) : mutateNumber(safeNum1);
    const mutatedNum2 = mutateByLastDigit ? mutateLastDigit(safeNum2) : mutateNumber(safeNum2);

    const nextNum1 = isDecimalTopic ? clampDecimal(mutatedNum1) : clampPositiveInteger(mutatedNum1);
    const nextNum2 = isDecimalTopic ? clampDecimal(mutatedNum2) : clampPositiveInteger(mutatedNum2);

    if (nextNum1 === safeNum1 && nextNum2 === safeNum2) continue;

    if (operator === '-') {
      if (nextNum1 < nextNum2) continue;
      return {
        num1: nextNum1,
        num2: nextNum2,
        operator,
        answer: isDecimalTopic ? roundToDecimal(computeAnswer(nextNum1, nextNum2, operator), 1) : computeAnswer(nextNum1, nextNum2, operator),
        level: safeLevel,
        topic: normalizedTopic,
        chapterTitle,
        chapterId: String(wrongProblem?.chapterId || '')
      };
    }

    if (operator === '/') {
      const baseAnswer = safeNum2 === 0 ? 1 : Math.round(safeNum1 / safeNum2);
      const baseDivisor = Math.max(1, safeNum2);
      const divisorDelta = randomInt(minDelta, maxDelta);
      const nextDivisor = Math.max(
        1,
        clampPositiveInteger(baseDivisor + (Math.random() < 0.5 ? -divisorDelta : divisorDelta))
      );
      const nextAnswer = Math.max(1, baseAnswer + randomInt(-2, 2));
      const nextDividend = nextDivisor * nextAnswer;

      if (nextDividend === safeNum1 && nextDivisor === safeNum2) continue;

      return {
        num1: nextDividend,
        num2: nextDivisor,
        operator,
        answer: nextAnswer,
        level: safeLevel,
        topic: normalizedTopic,
        chapterTitle,
        chapterId: String(wrongProblem?.chapterId || '')
      };
    }

    return {
      num1: nextNum1,
      num2: nextNum2,
      operator,
      answer: isDecimalTopic ? roundToDecimal(computeAnswer(nextNum1, nextNum2, operator), 1) : computeAnswer(nextNum1, nextNum2, operator),
      level: safeLevel,
      topic: normalizedTopic,
      chapterTitle,
      chapterId: String(wrongProblem?.chapterId || '')
    };
  }

  return generateProblem(safeLevel, operator, {
    topic: normalizedTopic,
    chapterId: String(wrongProblem?.chapterId || ''),
    chapterTitle
  });
};
