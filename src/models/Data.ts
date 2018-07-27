import {
  StatsData,
} from '@/types';

const GITHUB_USER_LOGIN = 'tamino-martinius';

const waitFor = (duration: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const timeout: number = window.setTimeout(
      () => {
        resolve(timeout);
      },
      duration,
    );
  });
};

declare const DEBUG_MODE: boolean;
export class Data {
  constructor() {

  }

  async getStats(): Promise<StatsData> {
    const response = await fetch(`/${DEBUG_MODE ? 'dev' : GITHUB_USER_LOGIN}.json`);
    const data: StatsData = await response.json();
    return data;
  }
}

export default Data;
