import { describe, it, expect } from 'vitest';
import {
  toLocalInputValue,
  minScheduleValue,
  fromLocalInputValue,
} from './datetime.js';

describe('toLocalInputValue', () => {
  it('formats a date as local wall-clock time, not UTC', () => {
    // Built from local components, so the formatted string must echo them back
    // whatever the runner's timezone is. `toISOString()` would not.
    const date = new Date(2026, 2, 14, 9, 5); // 14 Mar 2026, 09:05 local
    expect(toLocalInputValue(date)).toBe('2026-03-14T09:05');
  });

  it('keeps a late-evening time on the same calendar day', () => {
    const date = new Date(2026, 2, 14, 23, 45);
    expect(toLocalInputValue(date)).toBe('2026-03-14T23:45');
  });

  it('accepts an ISO string', () => {
    const iso = new Date(2026, 6, 1, 14, 30).toISOString();
    expect(toLocalInputValue(iso)).toBe('2026-07-01T14:30');
  });

  it('returns an empty string for an invalid date', () => {
    expect(toLocalInputValue('not a date')).toBe('');
    expect(toLocalInputValue(new Date('nope'))).toBe('');
  });
});

describe('minScheduleValue', () => {
  it('is in the future when read back as local time', () => {
    const parsed = fromLocalInputValue(minScheduleValue());
    expect(parsed.getTime()).toBeGreaterThan(Date.now());
  });

  // The original bug: a UTC-formatted `min` sat hours in the past for any
  // positive UTC offset, so the picker accepted times the server rejected.
  it('is not more than two minutes away from now', () => {
    const parsed = fromLocalInputValue(minScheduleValue());
    expect(parsed.getTime() - Date.now()).toBeLessThan(2 * 60 * 1000);
  });
});

describe('fromLocalInputValue', () => {
  it('round-trips a value produced by toLocalInputValue', () => {
    const original = new Date(2026, 10, 3, 18, 20);
    const parsed = fromLocalInputValue(toLocalInputValue(original));
    // datetime-local has minute precision, so compare to the minute.
    expect(parsed.getTime()).toBe(original.getTime());
  });

  it('returns null for empty or invalid input', () => {
    expect(fromLocalInputValue('')).toBeNull();
    expect(fromLocalInputValue(null)).toBeNull();
    expect(fromLocalInputValue('garbage')).toBeNull();
  });
});
