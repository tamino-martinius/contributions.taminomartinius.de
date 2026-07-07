/** Resolves once at least `minDuration` ms have passed since `startTime` (Date.now()-based). */
export const waitRemainder = (startTime: number, minDuration: number): Promise<void> => {
  const remaining = minDuration - (Date.now() - startTime);
  if (remaining <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, remaining);
  });
};
