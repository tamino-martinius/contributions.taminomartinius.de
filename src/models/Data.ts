import {
  StatsData,
} from '@/types';
import Util from '@/models/Util';

const GITHUB_USER_LOGIN = 'tamino-martinius';
const MIN_WAIT_DURATION = 3000;

declare const DEBUG_MODE: boolean;
export class Data {
  constructor() {

  }

  async getStats(): Promise<StatsData> {
    const startTime = Date.now();
    const response = await fetch(`/${DEBUG_MODE ? 'dev' : GITHUB_USER_LOGIN}.json`);
    const data: StatsData = await response.json();
    const duration = Date.now() - startTime;
    if (duration < MIN_WAIT_DURATION) {
      await Util.waitFor(MIN_WAIT_DURATION - duration);
    }
    return data;
  }
}

export default Data;
