import { describe, expect, it } from 'vitest';

import { addMonthsClamped, formatDate, monthsAndDaysBetween, parseFlexibleDate, parseManyDates } from './date';

describe('parseFlexibleDate', () => {
  const today = new Date(2026, 0, 28);

  it('parses compact DDMM with inferred year', () => {
    const result = parseFlexibleDate('3112', today);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(formatDate(result.date)).toBe('31/12/2025');
      expect(result.inferredYear).toBe(true);
    }
  });

  it('parses DD/MM/YY as 2000s', () => {
    const result = parseFlexibleDate('05/02/26', today);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(formatDate(result.date)).toBe('05/02/2026');
    }
  });

  it('rejects impossible dates', () => {
    const result = parseFlexibleDate('31/02/2026', today);
    expect(result.ok).toBe(false);
  });
});

describe('parseManyDates', () => {
  const today = new Date(2026, 0, 28);

  it('deduplicates and sorts dates', () => {
    const { dates, errors } = parseManyDates('05/01/26, 04/12/25 05/01/26', today);
    expect(errors).toEqual([]);
    expect(dates.map(formatDate)).toEqual(['04/12/2025', '05/01/2026']);
  });
});

describe('addMonthsClamped', () => {
  it('clamps to the last day of month', () => {
    const start = new Date(2025, 0, 31);
    const result = addMonthsClamped(start, 1);
    expect(formatDate(result)).toBe('28/02/2025');
  });

  it('preserves day when possible', () => {
    const start = new Date(2025, 4, 15);
    const result = addMonthsClamped(start, 6);
    expect(formatDate(result)).toBe('15/11/2025');
  });
});

describe('monthsAndDaysBetween', () => {
  it('returns months and days forward', () => {
    const start = new Date(2025, 0, 31);
    const end = new Date(2025, 2, 5);
    const result = monthsAndDaysBetween(start, end);
    expect(result).toEqual({ months: 1, days: 5, isPast: false });
  });

  it('returns months and days backward', () => {
    const start = new Date(2025, 6, 10);
    const end = new Date(2025, 5, 1);
    const result = monthsAndDaysBetween(start, end);
    expect(result).toEqual({ months: 1, days: 9, isPast: true });
  });
});
