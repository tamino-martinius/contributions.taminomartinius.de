import {
  Dict,
  StatsData,
} from '@/types';

const GITHUB_USER_LOGIN = 'tamino-martinius';

export class Data {
  constructor() {

  }

  async getStats(): Promise<StatsData> {
    const response = await fetch(`/${GITHUB_USER_LOGIN}.json`);
    const data: StatsData = await response.json();
    return data;
  }
}

export default Data;
