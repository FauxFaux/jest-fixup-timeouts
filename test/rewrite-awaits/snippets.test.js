import { transform } from '@babel/core';

function runPlugin(code) {
  return transform(code, {
    babelrc: false,
    filename: 'test.js',
    plugins: [__dirname + '/../../lib/rewrite-awaits'],
  });
}

describe('translation of snippets', () => {
  it('transforms a bare function call in statement context', () => {
    // language=JavaScript
    const code = 'async function foo() { await bar(); }';
    expect(runPlugin(code).code).toMatchSnapshot();
  });

  it('transforms an expression', () => {
    // language=JavaScript
    const code = 'async function foo() { return await bar(); }';
    expect(runPlugin(code).code).toMatchSnapshot();
  });

  it('transforms an existing expect', () => {
    // language=JavaScript
    const code =
      'async function foo() {' +
      ' await expect(bar()).resolves.toBe("hot potatoes");' +
      '}';
    expect(runPlugin(code).code).toMatchSnapshot();
  });

  it('skips double stacking', () => {
    // language=JavaScript
    const code = 'async function foo() { await expect.withinDeadline(bar()); }';
    expect(runPlugin(code).code).toMatchSnapshot();
  });

  it('transforms multiple awaits', () => {
    // language=JavaScript
    const code =
      'async function foo() {' +
      ' await bar(1, 2, 3);' +
      ' await quux(1, 2, 3);' +
      '}';
    expect(runPlugin(code).code).toMatchSnapshot();
  });

  it('transforms await in argument context', () => {
    // language=JavaScript
    const code = 'async function foo() { await bar(1, await quux(), 3); }';
    expect(runPlugin(code).code).toMatchSnapshot();
  });
});
