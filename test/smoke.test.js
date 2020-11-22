import { transform } from '@babel/core';

function runPlugin(code) {
  return transform(code, {
    babelrc: false,
    filename: 'test.js',
    plugins: [__dirname + '/../lib/rewrite-awaits.js'],
  });
}

describe('smoke testing', () => {
  it('transforms just one line', () => {
    // language=JavaScript
    const code = 'async function foo() {' + '  await bar();' + '}';

    expect(runPlugin(code).code).toMatchSnapshot();
  });
});
