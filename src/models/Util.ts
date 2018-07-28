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
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

export default Util;
