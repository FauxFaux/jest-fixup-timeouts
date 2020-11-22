### jest-fixup-timeouts

Improve the timeout errors provided by Jest.

When a timeout occurs, you get an exception and a stack trace. This is
an improvement over Jest's previous behaviour, where you only get to see
the test name.


### Screenshots

Here, we've timed out during a sleep inside application code. You get a stack
back to the test that called the application code:

```
 FAIL  test/sleepy.spec.ts
  ✕ testy mctestface (184 ms)

    deadline exceeded (waited here for 123ms)

      3 | export async function mySleep(duration: number) {
    > 4 |   return await sleep(duration);
        |   ^
      5 | }

      at Object.mySleep (src/index.ts:4:3)
      at Object.<anonymous> (test/sleepy.spec.ts:6:3)
```


If you don't want to mess with your application code, you could also see where
the test was when it timed out:

```
 FAIL  test/sleepy.spec.ts
  ✕ testy mctestface (184 ms)

    deadline exceeded (waited here for 125ms)

      4 | test('stuff', async () => {
      5 |   await sleep(55);
    > 6 |   await mySleep(500);
        |   ^
      7 | }, 200);

      at Object.<anonymous> (test/sleepy.spec.ts:6:3)
```


For comparison, here is the original Jest error:

```
    thrown: "Exceeded timeout of 200 ms for a test.
    Use jest.setTimeout(newTimeout) to increase the timeout value, if this is a long-running test."
    > 4 | test('stuff', async () => {
        | ^

      at Object.<anonymous> (test/sleepy.spec.ts:4:1)
```


### How does it work?

We compute a deadline, then check it in various places. When it is exceeded,
throw a regular exception and let the test framework deal with that failure.


#### Computing the deadline

A custom environment, `jest-fixup-timeouts/environment`, hooks into `jest-circus`'
test events to observe the start of a test. At this point, you can compute the
*deadline* (the wall-clock time at which the test must have finished), and store it.

I have chosen to store it as `test.deadline`, which is available everywhere.

As a helper, it also provides `expect.withinDeadline(promise)`, which races the
promise against the deadline.

Note, because I can't work out how to phrase this in a way that is clear:
`test` and `expect` here refer to the Jest globals, which are normally injected.


#### Checking the deadline

A babel plugin, `jest-fixup-timeouts/rewrite-awaits`, transforms `await foo()`
into `await expect.withinDeadline(foo())`.

You can apply this plugin wherever you want. For example, you might want to only
apply it to tests, or to certainly bits of your infrastructure code (e.g. your RPC library?),
or you can write out the `expect.withinDeadline` by hand.

e.g.

```javascript
{
  plugins: ['jest-fixup-timeouts/rewrite-awaits']
}
```

```javascript
{
  overrides: [{
    test: ['**/*.spec.ts', '**/rpc/*'],
    plugins: ['jest-fixup-timeouts/rewrite-awaits']
  }]
}
```


### Status

This is a straw-man (hack) implementation which depends on some
implementation details, but isn't actually significantly worse
than the patch would be for Jest.

Currently, it only checks for timeouts during `await`, but this is a
good approximation, it appears.
