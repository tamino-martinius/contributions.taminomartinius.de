import { describe, expect, it } from 'vitest';
import { getDateKeysForYear, isLeapYear, splitDateKey } from '@/util/recordKey';

describe('recordKey', () => {
  it('splits date keys', () => {
    expect(splitDateKey('2024-03-02')).toEqual([2024, '03', '02']);
  });
  it('detects leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });
  it('generates 366 keys for leap years', () => {
    expect(getDateKeysForYear(2024)).toHaveLength(366);
    expect(getDateKeysForYear(2026)).toHaveLength(365);
  });
});
