const fs = require('fs');
const process = require('child_process');
const tmp = require('tmp');
const strip = require('strip-ansi');

describe('the results of calling jest', () => {
  let dir, removeCallback;

  it('does nothing by default', async () => {
    expect(
      jestMessages(
        // language=JavaScript
        'const sleep = require("sleep-promise");\n' +
          'test("foo", async () => {\n' +
          ' await sleep(60);\n' +
          '}, 30);',
        {},
      ),
    ).toMatchSnapshot();
  });

  it('detects deadline exceeded for a test', async () => {
    expect(
      jestMessages(
        // language=JavaScript
        'const sleep = require("sleep-promise");\n' +
          'test("foo", async () => {\n' +
          ' await sleep(60);\n' +
          '}, 30);',
        {
          testEnvironment: '../../environment',
        },
        {
          plugins: ['../../rewrite-awaits'],
        },
      ),
    ).toMatchSnapshot();
  });

  function jestMessages(testJavaScript, jestConfig, babelConfig = {}) {
    fs.writeFileSync(`${dir}/foo.test.js`, testJavaScript);
    fs.writeFileSync(
      `${dir}/jest.config.json`,
      JSON.stringify({
        testFailureExitCode: 0,
        testRunner: 'jest-circus/runner',
        ...jestConfig,
      }),
    );
    fs.writeFileSync(
      `${dir}/babel.config.json`,
      JSON.stringify({
        ...babelConfig,
      }),
    );
    const stdout = runJest(
      dir,
      ['--runInBand', '--json', '--no-colors', '--no-cache'],
      jestConfig,
    );
    return JSON.parse(stdout.toString('utf-8')).testResults.map((result) =>
      strip(result.message),
    );
  }

  beforeEach(() => {
    const cache = `${__dirname}/../../.temp`;
    if (!fs.existsSync(cache)) {
      fs.mkdirSync(cache);
    }
    ({ name: dir, removeCallback } = tmp.dirSync({
      tmpdir: cache,
      unsafeCleanup: true,
    }));
  });

  afterEach(() => {
    removeCallback();
  });
});

function runJest(dir, args) {
  try {
    return process.execFileSync(require.resolve('jest/bin/jest'), args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: dir,
    });
  } catch (err) {
    console.info(err.stdout.toString('utf-8'));
    console.error(err.stderr.toString('utf-8'));
    throw err;
  }
}
