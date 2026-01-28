import { describe, expect, it } from 'vitest';

import { formatDate, parseFlexibleDate, parseManyDates } from './date';

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
