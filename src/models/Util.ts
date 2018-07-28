export class Util {
  constructor() {

  }

  static waitFor(duration: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const timeout: number = window.setTimeout(
        () => {
          resolve(timeout);
        },
        duration,
      );
    });
  }
}

export default Util;
