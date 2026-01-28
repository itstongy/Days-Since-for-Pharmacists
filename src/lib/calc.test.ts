import { describe, expect, it } from 'vitest';

import { computeCanSupplyDate, computeSupplyMetrics, pickRecencyStatus, supplyDecision } from './calc';
import { formatDate } from './date';

describe('computeSupplyMetrics', () => {
  const today = new Date(2026, 0, 28);
  const startDate = new Date(2026, 0, 10);

  it('computes days since and runout correctly', () => {
    const metrics = computeSupplyMetrics({ startDate, amount: 28, perDay: 1, today });
    expect(metrics.daysSince).toBe(18);
    expect(formatDate(metrics.runoutDate)).toBe('07/02/2026');
    expect(metrics.daysLeft).toBe(10);
    expect(metrics.percentRemaining).toBeCloseTo(10 / 28, 3);
  });
});

describe('supplyDecision', () => {
  it('flags early supply', () => {
    const decision = supplyDecision(15, 9);
    expect(decision.kind).toBe('bad');
  });

  it('flags due soon', () => {
    const decision = supplyDecision(5, 9);
    expect(decision.kind).toBe('good');
  });
});

describe('computeCanSupplyDate', () => {
  it('calculates earliest supply date', () => {
    const today = new Date(2026, 0, 28);
    const { date, daysUntilOk } = computeCanSupplyDate(today, 12, 9);
    expect(daysUntilOk).toBe(3);
    expect(formatDate(date)).toBe('31/01/2026');
  });
});

describe('pickRecencyStatus', () => {
  it('returns recent when within 7 days', () => {
    const status = pickRecencyStatus(4);
    expect(status.kind).toBe('good');
  });
});
