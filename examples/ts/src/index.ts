import sleep = require('sleep-promise');

export async function mySleep(duration: number) {
  return await sleep(duration);
}
