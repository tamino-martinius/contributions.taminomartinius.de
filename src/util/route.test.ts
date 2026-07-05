import { describe, expect, it } from 'vitest';
import { parseLiveUser } from '@/util/route';

describe('parseLiveUser', () => {
  it('matches ~username paths', () => {
    expect(parseLiveUser('/~slavadev')).toBe('slavadev');
    expect(parseLiveUser('/~tamino-martinius/')).toBe('tamino-martinius');
  });
  it('returns null otherwise', () => {
    expect(parseLiveUser('/')).toBe(null);
    expect(parseLiveUser('/~')).toBe(null);
    expect(parseLiveUser('/~-bad')).toBe(null);
    expect(parseLiveUser('/~a/b')).toBe(null);
    expect(parseLiveUser(`/~${'a'.repeat(40)}`)).toBe(null);
  });
});
