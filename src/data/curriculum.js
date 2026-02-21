const curriculum = [
  {
    id: 'c01-number-basics',
    grade: 1,
    semester: 1,
    level: 1,
    topic: 'number-basics',
    title: '9까지의 수',
    questionCount: 8,
    emoji: '🍎',
    operations: ['+'],
    description: '9까지의 수를 세고, 0, 순서, 비교를 함께 익혀 수량의 기초를 다져요.',
    concept: [
      '물건을 보며 1~9개를 정확히 세고 숫자로 연결해요.',
      '0은 “아무것도 없음”으로 받아들이고 0의 의미를 이해해요.',
      '첫째/둘째/셋째와 같은 순서 표현을 사용해 다음/이전 수를 말해보세요.',
      '“더 많다/적다/같다”를 말문법과 함께 비교하며 수의 크기를 정리해요.',
      '가르기와 모으기로 수의 전체 구조를 직접 만져보며 다시 쪼개고 합쳐요.'
    ],
    examples: ['🍎가 3개', '3의 다음 수는?', '0은 무엇일까요?', '5 < 7']
  },
  {
    id: 'c02-operations-basics',
    grade: 1,
    semester: 1,
    level: 1,
    topic: 'operations-basics',
    title: '덧셈과 뺄셈',
    questionCount: 8,
    emoji: '🍉',
    operations: ['+', '-'],
    description: '덧셈(+)과 뺄셈(-) 기호의 의미를 익히고 식을 읽어 정확히 계산해요.',
    concept: [
      '+, -, =를 볼 때 숫자의 흐름을 한 번씩 소리 내어 읽어요.',
      '합과 차를 기호 중심으로 풀면서 전체 수에서 빼고 남은 수를 확인해요.',
      '문장 속 등식의 좌변·우변 위치를 바꿔 말해도 같은 의미인지 확인해요.'
    ],
    examples: ['3 + 4 = 7', '9 - 3 = 6', '5 + ? = 8', '10 - ? = 2']
  },
  {
    id: 'c07-shape-count',
    grade: 1,
    semester: 1,
    level: 1,
    topic: 'shapes',
    title: '여러 가지 모양',
    questionCount: 8,
    emoji: '🧩',
    operations: ['+'],
    description: '모양을 분류하고 개수를 세는 힘을 키우는 단원입니다.',
    concept: [
      '도형의 모양을 말로 구분한 뒤 개수를 세요.',
      '같은 모양끼리 묶으면 계산이 더 쉬워집니다.',
      '도형 수를 세면서 덧셈으로 바꿔 적어보세요.'
    ],
    examples: ['🟦 + 🟩', '🔺 + 🔺 = 2']
  },
  {
    id: 'c08-compare',
    grade: 1,
    semester: 1,
    level: 1,
    topic: 'compare',
    title: '비교하기',
    questionCount: 8,
    emoji: '⚖️',
    operations: ['+'],
    description: '두 수의 크기, 차이, 관계를 비교하며 사고를 정렬합니다.',
    concept: [
      '같은 기준으로 두 수를 보고 “더 크다/작다”를 판단해요.',
      '차이는 빼기로 확인하면 비교 포인트가 명확해집니다.',
      '문장으로 바꾸면 계산 실수를 줄일 수 있어요.'
    ],
    examples: ['9 > 7', '6 < 8']
  },
  {
    id: 'c03-add-carry',
    grade: 1,
    semester: 2,
    level: 2,
    topic: 'addition-carry',
    title: '100까지의 수',
    questionCount: 10,
    emoji: '🧩',
    operations: ['+'],
    description: '100 이하 숫자에서 받아올림이 자주 나타나는 덧셈을 반복 훈련합니다.',
    concept: [
      '일의 자리 합이 10 이상이면 십의 자리로 올려 정리해요.',
      '자리별 계산을 먼저 생각하면 결과가 흔들리지 않습니다.',
      '각 자리별 계산을 말로 확인하면 정답 오답을 줄일 수 있어요.'
    ],
    tutorialSteps: [
      '37 + 28처럼 1의 자리부터 더해요. 7 + 8 = 15',
      '일의 자리에서 10이 넘으면 5를 쓰고 1을 위로 올려요.',
      '윗자리에 올라간 1을 십의 자리 계산에 더해요. 예: 3 + 2 + 1 = 6'
    ],
    examples: ['37 + 28 = 65', '58 + 47 = 105']
  },
  {
    id: 'c04-sub-borrow',
    grade: 1,
    semester: 2,
    level: 2,
    topic: 'subtraction-borrow',
    title: '시계 보기와 규칙 찾기',
    questionCount: 10,
    emoji: '🕒',
    operations: ['-'],
    description: '시간 단위를 활용해 수의 규칙을 찾고 규칙적으로 접근합니다.',
    concept: [
      '숫자의 변화를 관찰하고 규칙을 한 문장으로 정리해요.',
      '규칙이 보이면 더하기/빼기로 점검합니다.',
      '결과를 직관적으로 예측한 뒤 계산해 보세요.'
    ],
    tutorialSteps: [
      '숫자 패턴에서 다음 수를 찾는 연습을 먼저 해요.',
      '규칙이 보이면 더하기/빼기로 점검합니다.',
      '예: 9, 11, 13 ...처럼 증가량을 확인해요.'
    ],
    examples: ['58 - 12 = 46', '71 - 18 = 53']
  },
  {
    id: 'c09-three-digit',
    grade: 2,
    semester: 1,
    level: 2,
    topic: 'three-digit',
    title: '세 자리 수',
    questionCount: 10,
    emoji: '🔢',
    operations: ['+'],
    description: '세 자리 수에서 각 자릿수의 의미를 파악해 정확히 계산합니다.',
    concept: [
      '백의 자리, 십의 자리, 일의 자리부터 차례대로 보면 쉬워요.',
      '자리 값을 유지하며 계산하면 실수를 크게 줄일 수 있어요.',
      '오답은 자리 이동을 다시 점검하면 빠르게 찾습니다.'
    ],
    examples: ['123 + 48 = 171', '205 + 76 = 281']
  },
  {
    id: 'c10-figure-shape',
    grade: 2,
    semester: 1,
    level: 2,
    topic: 'geometry-figures',
    title: '여러 가지 도형',
    questionCount: 8,
    emoji: '🔷',
    operations: ['+'],
    description: '도형 분류와 개수를 통해 계산 문항을 자연스럽게 연결합니다.',
    concept: [
      '도형 분류 기준을 잡고 개수를 세요.',
      '비슷한 도형끼리 묶으면 합산이 쉬워집니다.',
      '문항을 수식으로 바꾸는 연습을 함께 해요.'
    ],
    examples: ['◻ + ◻ + ◇ = 3', '△ + △ = 2']
  },
  {
    id: 'c11-measure-length',
    grade: 2,
    semester: 1,
    level: 2,
    topic: 'measurement-length',
    title: '길이 재기',
    questionCount: 8,
    emoji: '📏',
    operations: ['+'],
    description: '길이 비교와 덧셈으로 기본 계산 감각을 강화합니다.',
    concept: [
      '길이 비교는 기준 단위로 통일하면 정확해집니다.',
      '덧셈을 한 번에 하지 말고 조각합으로 나눠 계산해요.',
      '차이를 중심으로 반대쪽 수식도 확인해보세요.'
    ],
    examples: ['3 + 4 = 7', '8 + 2 = 10']
  },
  {
    id: 'c12-four-digit',
    grade: 2,
    semester: 2,
    level: 3,
    topic: 'four-digit',
    title: '네 자리 수',
    questionCount: 10,
    emoji: '🧱',
    operations: ['+'],
    description: '네 자리 수 덧셈과 뺄셈으로 자릿수 개념을 한 단계 확장합니다.',
    concept: [
      '네 자리 수는 천의 자리까지를 포함해 자리별로 정렬합니다.',
      '일의 자리에서 시작해 자리별 이동이 필요한지 점검해요.',
      '큰 수일수록 자리표를 같이 쓰면 안정적입니다.'
    ],
    examples: ['1,258 + 739 = 1,997', '3,002 - 1,458 = 1,544']
  },
  {
    id: 'c05-times-table',
    grade: 2,
    semester: 2,
    level: 3,
    topic: 'multiplication',
    title: '곱셈구구',
    questionCount: 10,
    emoji: '🔢',
    operations: ['*'],
    description: '곱셈구구를 통해 반복 덧셈을 빠르게 인식하는 연습을 합니다.',
    concept: [
      '작은 수 곱셈부터 패턴을 찾고 나아갑니다.',
      '결과를 암기만 하지 말고 재빠르게 분해해서 봐요.',
      '틀릴 때는 배수의 규칙으로 다시 점검합니다.'
    ],
    examples: ['7 × 6 = 42', '8 × 9 = 72']
  },
  {
    id: 'c06-division',
    grade: 3,
    semester: 1,
    level: 3,
    topic: 'division',
    title: '나눗셈의 의미',
    questionCount: 12,
    emoji: '🥧',
    operations: ['/'],
    description: '일상에서의 나눗셈 의미를 익히고, 나머지 없는 경우를 중심으로 정확하게 해결합니다.',
    concept: [
      '나눗셈은 “각각 동일하게 나눠주기”로 해석해요.',
      '나눗셈은 곱셈으로 역검산해 정확도를 높입니다.',
      '입력 전에 예상값을 먼저 말해보면 실수가 줄어요.'
    ],
    examples: ['12 ÷ 3 = 4', '24 ÷ 6 = 4']
  },
  {
    id: 'c13-frac-dec',
    grade: 3,
    semester: 1,
    level: 2,
    topic: 'fraction-decimal',
    title: '분수와 소수',
    questionCount: 8,
    emoji: '🍕',
    operations: ['+'],
    description: '기초 분수/소수 감각을 덧셈 개념과 연결해 푸는 감각을 준비합니다.',
    concept: [
      '정수 중심으로 시작해 분수/소수 개념은 표현법 중심으로 익힙니다.',
      '분모/분자는 뒤로 미루고 값의 크기 비교로 접근해요.',
      '문장을 수식으로 바꿔 보면 관계가 더 또렷해집니다.'
    ],
    examples: ['1 + 2 = 3', '2 + 1 = 3']
  },
  {
    id: 'c14-circle',
    grade: 3,
    semester: 2,
    level: 4,
    topic: 'circle',
    title: '원',
    questionCount: 8,
    emoji: '⭕',
    operations: ['+'],
    description: '원과 관련된 기본 개념을 수와 식으로 정리하는 연습을 합니다.',
    concept: [
      '도형 이름을 말하고 성질을 짧은 문장으로 정리합니다.',
      '계산은 개수를 정리하고 수로 표현해요.',
      '문항을 먼저 읽고 그림으로 해석하면 오답을 줄일 수 있습니다.'
    ],
    examples: ['원 + 1 = 2', '2 + 2 = 4']
  },
  {
    id: 'c15-data-class',
    grade: 3,
    semester: 2,
    level: 4,
    topic: 'data',
    title: '자료의 정리',
    questionCount: 8,
    emoji: '🗂️',
    operations: ['+'],
    description: '자료를 보고 수를 묶어 단순 계산으로 정리하는 연습을 합니다.',
    concept: [
      '표/목록을 요약해 숫자로 바꿔 봅니다.',
      '합계부터 먼저 계산하면 분산 오차를 줄일 수 있습니다.',
      '문항을 작은 항목으로 쪼개어 더하면 정확도가 올라가요.'
    ],
    examples: ['1 + 3 + 5 = 9', '4 + 4 + 2 = 10']
  }
];

const CHAPTER_ID_ALIASES = {
  'c01-add-basics': 'c01-number-basics',
  'c02-sub-basics': 'c02-operations-basics'
};

export const getCurriculumById = (id = '') => {
  const normalizedId = String(id || '').trim();
  const canonicalId = CHAPTER_ID_ALIASES[normalizedId] || normalizedId;

  return curriculum.find((item) => item.id === canonicalId)
    || curriculum.find((item) => item.id === normalizedId);
};

export default curriculum;
