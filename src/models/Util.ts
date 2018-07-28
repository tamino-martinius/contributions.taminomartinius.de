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

  static isInViewport(elem: HTMLElement) {
    const bounding = elem.getBoundingClientRect();
    return bounding.top <= (window.innerHeight || document.documentElement.clientHeight);
  }
}

export default Util;
