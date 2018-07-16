const GITHUB_USER_LOGIN = 'tamino-martinius';

export class Data {
  constructor() {

  }

  async create() {
    console.log(fetch(`/${ GITHUB_USER_LOGIN }`));
  }
}

export default Data;
