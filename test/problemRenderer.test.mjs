import assert from 'node:assert/strict';
import { test } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ProblemRenderer,
  ShapeGroup,
  AnalogClock,
  SimpleBarChart,
  ZeroConcept,
  SequencePrompt,
  CompareVisual
} from '../src/components/ProblemRenderer.jsx';

test('ProblemRenderer renders standard arithmetic problem text', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: { num1: 12, num2: 7, operator: '+', answer: 19 }
    })
  );

  assert.equal(markup.includes('12'), true);
  assert.equal(markup.includes('+'), true);
  assert.equal(markup.includes('='), true);
  assert.equal(markup.includes('problem-text'), true);
});

test('ProblemRenderer renders shape visual with shape items', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'count-shapes',
          target: '🟦',
          items: ['🟦', '🔷', '🟦', '🟢'],
          answer: 2
        }
      }
    })
  );

  assert.equal(markup.includes('shape-group-wrap'), true);
  assert.equal(markup.includes('shape-item'), true);
  assert.equal(markup.includes('🟦'), true);
});

test('ProblemRenderer renders clock visual with clock structure', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'clock-reading',
          time: { hour: 3, minute: 30 },
          answer: 330
        }
      }
    })
  );

  assert.equal(markup.includes('analog-clock'), true);
  assert.equal(markup.includes('clock-hand'), true);
  assert.equal(markup.includes('hhmm'), true);
});

test('ProblemRenderer renders chart visual with bar cells', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'chart-bar',
          question: '🍎는 🍊보다 몇 개 더 많나요?',
          data: [
            { label: '🍎', value: 5 },
            { label: '🍊', value: 2 },
            { label: '🍌', value: 3 }
          ]
        }
      }
    })
  );

  assert.equal(markup.includes('simple-chart'), true);
  assert.equal(markup.includes('bar-cell'), true);
  assert.equal(markup.includes('🍎'), true);
  assert.equal(markup.includes('bar-value'), true);
});

test('ProblemRenderer renders zero-concept visual', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'zero-concept',
          count: 3,
          prompt: '접시에 사과가 몇 개 있나요?'
        }
      }
    })
  );

  assert.equal(markup.includes('zero-concept-wrap'), true);
  assert.equal(markup.includes('접시에 사과가 몇 개 있나요?'), true);
  assert.equal(markup.includes('zero-plate-stage'), true);
  assert.equal((markup.match(/class=\"zero-apple\"/g) || []).length, 3);
});

test('ProblemRenderer renders sequence visual with prompt', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'sequence',
          prompt: '3의 다음 수는?',
          answer: 4,
          number: 3
        }
      }
    })
  );

  assert.equal(markup.includes('sequence-wrap'), true);
  assert.equal(markup.includes('3의 다음 수는?'), true);
  assert.equal(markup.includes('3'), true);
});

test('ProblemRenderer renders compare visual', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'compare',
          left: { label: '🍎', count: 5 },
          right: { label: '🍊', count: 3 },
          question: '🍎와 🍊를 비교해 보세요.'
        }
      }
    })
  );

  assert.equal(markup.includes('compare-wrap'), true);
  assert.equal(markup.includes('🍎와 🍊를 비교해 보세요.'), true);
  assert.equal(markup.includes('compare-item'), true);
});

test('ProblemRenderer returns empty string when visual type is unknown', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        visual: {
          type: 'unsupported'
        }
      }
    })
  );

  assert.equal(markup, '');
});

test('ProblemRenderer renders split-combine interactive visual', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        num1: 5,
        num2: 3,
        operator: '-',
        visual: {
          type: 'interactive',
          subType: 'split-combine',
          totalCount: 1,
          target: '🍎'
        }
      }
    })
  );

  assert.equal(markup.includes('split-zone'), true);
  assert.equal(markup.includes('problem-text'), true);
  assert.equal(markup.includes('5 - 3'), true);
  assert.equal((markup.match(/split-item/g) || []).length, 1);
});

test('ProblemRenderer renders base-10 interactive visual', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        num1: 20,
        num2: 5,
        operator: '+',
        visual: {
          type: 'interactive',
          subType: 'base-10-blocks',
          tensCount: 1,
          onesCount: 2
        }
      }
    })
  );

  assert.equal(markup.includes('base10-tens-wrap'), true);
  assert.equal(markup.includes('problem-text'), true);
  assert.equal(markup.includes('20 + 5'), true);
  assert.equal((markup.match(/base10-tens-item/g) || []).length, 1);
});

test('ProblemRenderer renders fraction-cut interactive visual', () => {
  const markup = renderToStaticMarkup(
    React.createElement(ProblemRenderer, {
      problem: {
        num1: 1,
        num2: 2,
        operator: '+',
        visual: {
          type: 'interactive',
          subType: 'fraction-cuts',
          totalSlices: 6,
          denominator: 6,
          coloredCount: 2
        }
      }
    })
  );

  assert.equal(markup.includes('fraction-stage'), true);
  assert.equal(markup.includes('problem-text'), true);
  assert.equal(markup.includes('1 + 2'), true);
  assert.equal(markup.includes('조각 자르기'), true);
});

test('ShapeGroup renders fallback target and subtitle', () => {
  const markup = renderToStaticMarkup(React.createElement(ShapeGroup, {
    visual: {
      target: '🔺',
      items: ['🔺', '🟦', '🔺']
    }
  }));

  assert.equal(markup.includes('shape-group-wrap'), true);
  assert.equal(markup.includes('타겟 모양만 정확히 세고 정답을 입력하세요.'), true);
});

test('AnalogClock returns expected fallback when time missing', () => {
  const markup = renderToStaticMarkup(React.createElement(AnalogClock, {}));

  assert.equal(markup.includes('시각을'), true);
  assert.equal(markup.includes('clock-hand'), true);
});

test('SimpleBarChart safely handles empty data', () => {
  const markup = renderToStaticMarkup(React.createElement(SimpleBarChart, {}));

  assert.equal(markup.includes('simple-chart'), true);
  assert.equal(markup.includes('자료를 보고 차이를 구하세요.'), true);
});

test('ZeroConcept renders empty slots and captions', () => {
  const markup = renderToStaticMarkup(React.createElement(ZeroConcept, {
    visual: {
      count: 2,
      prompt: '접시에 사과가 몇 개 있나요?'
    }
  }));

  assert.equal(markup.includes('zero-plate-stage'), true);
  assert.equal(markup.includes('접시에 사과가 몇 개 있나요?'), true);
  assert.equal((markup.match(/class=\"zero-apple\"/g) || []).length, 2);
});

test('SequencePrompt exposes provided prompt', () => {
  const markup = renderToStaticMarkup(React.createElement(SequencePrompt, {
    visual: {
      prompt: '4의 다음 수는?',
      number: 4
    }
  }));

  assert.equal(markup.includes('4의 다음 수는?'), true);
  assert.equal(markup.includes('sequence-number'), true);
});

test('SequencePrompt hides numeric badge for ordinal question', () => {
  const markup = renderToStaticMarkup(React.createElement(SequencePrompt, {
    visual: {
      prompt: '둘째는 몇 번째 수일까요?',
      ordinalIndex: 2
    }
  }));

  assert.equal(markup.includes('둘째는 몇 번째 수일까요?'), true);
  assert.equal(markup.includes('sequence-number'), false);
});

test('CompareVisual shows both groups and difference caption', () => {
  const markup = renderToStaticMarkup(React.createElement(CompareVisual, {
    visual: {
      left: { label: '🍎', count: 2 },
      right: { label: '🍊', count: 5 },
      question: '개수를 비교해보세요.'
    }
  }));

  assert.equal(markup.includes('compare-wrap'), true);
  assert.equal(markup.includes('개수를 비교해보세요.'), true);
  assert.equal(markup.includes('compare-group'), true);
});
