const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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

const generateAdditionProblem = (level) => {
  const safeLevel = clampLevel(level);

  if (safeLevel === 1) {
    for (let i = 0; i < 100; i += 1) {
      const num1 = randomInt(0, 9);
      const num2 = randomInt(0, 9);
      if (num1 + num2 <= 9) {
        return { num1, num2 };
      }
    }
    return { num1: 4, num2: 4 };
  }

  if (safeLevel === 2) {
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

const generateSubtractionProblem = (level) => {
  const safeLevel = clampLevel(level);

  if (safeLevel === 1) {
    for (let i = 0; i < 100; i += 1) {
      const num1 = randomInt(0, 9);
      const num2 = randomInt(0, 9);
      if (num1 >= num2) {
        return { num1, num2 };
      }
    }
    return { num1: 7, num2: 3 };
  }

  if (safeLevel === 2) {
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

const generateMultiplicationProblem = (level) => {
  const safeLevel = clampLevel(level);

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

const generateDivisionProblem = (level) => {
  const safeLevel = clampLevel(level);

  if (safeLevel === 1) {
    const num2 = randomInt(1, 9);
    const answer = randomInt(1, 9);
    return { num1: num2 * answer, num2, answer };
  }

  if (safeLevel === 2) {
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

export const generateProblem = (level = 1, operation = '+') => {
  const safeLevel = clampLevel(level);
  const safeOp = ['+', '-', '*', '/'].includes(operation) ? operation : '+';

  const operationGenerators = {
    '+': generateAdditionProblem,
    '-': generateSubtractionProblem,
    '*': generateMultiplicationProblem,
    '/': generateDivisionProblem
  };

  const { num1, num2 } = operationGenerators[safeOp](safeLevel);
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

  return {
    num1,
    num2,
    operator: safeOp,
    answer,
    level: safeLevel
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

  const { num1, num2, operator, level } = wrongProblem;
  const safeNum1 = Number(num1);
  const safeNum2 = Number(num2);
  const safeLevel = clampLevel(level);

  if (!Number.isFinite(safeNum1) || !Number.isFinite(safeNum2) || !['+', '-', '*', '/'].includes(operator)) {
    return null;
  }

  const base = Math.max(1, Math.max(Math.abs(safeNum1), Math.abs(safeNum2)));
  const minDelta = Math.max(1, Math.floor(base * 0.1));
  const maxDelta = Math.max(minDelta, Math.floor(base * 0.2));
  const clampPositiveInteger = (value) => Math.max(0, Math.round(value));

  const mutateNumber = (value) => {
    const delta = randomInt(minDelta, maxDelta);
    return clampPositiveInteger(
      value + (Math.random() < 0.5 ? -delta : delta)
    );
  };

  const mutateLastDigit = (value) => {
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

    const nextNum1 = clampPositiveInteger(mutatedNum1);
    const nextNum2 = clampPositiveInteger(mutatedNum2);

    if (nextNum1 === safeNum1 && nextNum2 === safeNum2) continue;

    if (operator === '-') {
      if (nextNum1 < nextNum2) continue;
      return {
        num1: nextNum1,
        num2: nextNum2,
        operator,
        answer: computeAnswer(nextNum1, nextNum2, operator),
        level: safeLevel
      };
    }

    if (operator === '/') {
      const baseAnswer = safeNum2 === 0 ? 1 : Math.round(safeNum1 / safeNum2);
      const baseDivisor = Math.max(1, safeNum2);
      const divisorDelta = randomInt(minDelta, maxDelta);
      const nextDivisor = Math.max(1, clampPositiveInteger(baseDivisor + (Math.random() < 0.5 ? -divisorDelta : divisorDelta)));
      const nextAnswer = Math.max(1, baseAnswer + randomInt(-2, 2));
      const nextDividend = nextDivisor * nextAnswer;

      if (nextDividend === safeNum1 && nextDivisor === safeNum2) continue;

      return {
        num1: nextDividend,
        num2: nextDivisor,
        operator,
        answer: nextAnswer,
        level: safeLevel
      };
    }

    return {
      num1: nextNum1,
      num2: nextNum2,
      operator,
      answer: computeAnswer(nextNum1, nextNum2, operator),
      level: safeLevel
    };
  }

  return generateProblem(safeLevel, operator);
};
