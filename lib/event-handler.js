module.exports = class TestEventHandler {
  constructor(context, config) {}

  runtimeGlobals;

  async handleTestEvent(event, state) {
    switch (event.name) {
      case 'setup':
        this.runtimeGlobals = event.runtimeGlobals;
        break;

      case 'hook_start':
      case 'test_start': {
        // copy-pasted from https://github.com/facebook/jest/blob/f9132f9106e3f1b3ae6f81d1f36222055c3fe111/packages/jest-circus/src/run.ts#L160
        const computedTimeout =
          (event.hook && event.hook.timeout) ||
          (event.test && event.test.timeout) ||
          state.testTimeout;
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

function isUs(line) {
  return line.includes('jest-fixup-timeouts') && line.includes('event-handler');
}

async function timeout(promise, ms) {
  let timeoutId;
  try {
    return await Promise.race([
      promise,
      (async () => {
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, ms);
        });
        const here = new Error(`deadline exceeded (waited here for ${ms}ms)`);
        here.stack = here.stack
          .split('\n')
          .filter((line) => !isUs(line))
          .join('\n');
        throw here;
      })(),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}
