import { mySleep } from '../src';
import * as sleep from 'sleep-promise';

test('stuff', async () => {
  await sleep(55);
  await mySleep(500);
}, 200);
