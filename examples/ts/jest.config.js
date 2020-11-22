module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      babelConfig: {
        // in real code, use 'jest-fixup-timeouts/rewrite-awaits'
        plugins: ['../../rewrite-awaits']
      }
    }
  },
  // in real code, use 'jest-fixup-timeouts/environment'
  testEnvironment: '../../environment',
  testRunner: 'jest-circus/runner',
};
