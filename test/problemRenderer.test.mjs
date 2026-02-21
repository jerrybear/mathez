import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ProblemRenderer,
  ShapeGroup,
  AnalogClock,
  SimpleBarChart
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
