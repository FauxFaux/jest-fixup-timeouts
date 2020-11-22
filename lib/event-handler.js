module.exports = class TestEventHandler {
  constructor(context, config) {}

  runtimeGlobals;

  async handleTestEvent(event, state) {
    switch (event.name) {
      case 'setup':
        this.runtimeGlobals = event.runtimeGlobals;
        break;

      case 'test_start': {
        // copy-pasted from https://github.com/facebook/jest/blob/f9132f9106e3f1b3ae6f81d1f36222055c3fe111/packages/jest-circus/src/run.ts#L160
        const computedTimeout = event.test.timeout || state.testTimeout;
        const deadline = Date.now() + computedTimeout - 20;
        this.runtimeGlobals.test.deadline = deadline;
        this.runtimeGlobals.expect.withinDeadline = (promise) => {
          return timeout(promise, deadline - Date.now());
        };

        break;
      }
    }
  }
};

async function timeout(promise, ms) {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      new Promise((resolve, reject) => {
        timeoutId = setTimeout(
          () =>
            reject(new Error(`deadline exceeded (waited here for ${ms}ms)`)),
          ms,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}
