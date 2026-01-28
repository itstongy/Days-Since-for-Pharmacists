import { daysBetween, startOfDay } from './date';

export type FrequencyAnalysis = {
  dates: Date[];
  gaps: number[];
  averageGap: number;
  medianGap: number;
  minGap: number;
  maxGap: number;
  expectedGap: number | null;
  okThreshold: number | null;
  balanceAtLastDate: number | null;
  balanceAsOfToday: number | null;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const a = sorted[mid - 1] ?? 0;
  const b = sorted[mid] ?? a;
  return sorted.length % 2 === 0 ? (a + b) / 2 : b;
}

export function analyzeFrequency(params: {
  dates: Date[];
  qty?: number | null;
  perDay?: number | null;
  bufferDays?: number | null;
  today?: Date;
}): FrequencyAnalysis {
  const sorted = [...params.dates]
    .map((d) => startOfDay(d))
    .sort((a, b) => a.getTime() - b.getTime());

  if (sorted.length < 2) {
    return {
      dates: sorted,
      gaps: [],
      averageGap: 0,
      medianGap: 0,
      minGap: 0,
      maxGap: 0,
      expectedGap: null,
      okThreshold: null,
      balanceAtLastDate: null,
      balanceAsOfToday: null
    };
  }

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    if (!prev || !next) continue;
    gaps.push(daysBetween(prev, next));
  }

  const averageGap = gaps.length ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 0;
  const medianGap = median(gaps);
  const minGap = gaps.length ? Math.min(...gaps) : 0;
  const maxGap = gaps.length ? Math.max(...gaps) : 0;

  const qty = params.qty ?? null;
  const perDay = params.perDay ?? null;
  const buffer = Number.isFinite(params.bufferDays ?? null) ? (params.bufferDays as number) : 9;

  const expectedGap = qty != null && perDay != null && perDay > 0 ? qty / perDay : null;
  const okThreshold = expectedGap != null ? Math.max(0, expectedGap - buffer) : null;

  let balanceAtLastDate: number | null = null;
  let balanceAsOfToday: number | null = null;

  if (qty != null && perDay != null && perDay > 0) {
    let balance = 0;
    for (let i = 0; i < sorted.length; i += 1) {
      balance += qty;
      if (i < sorted.length - 1) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (a && b) {
          const gap = daysBetween(a, b);
          balance -= gap * perDay;
        }
      }
    }
    balanceAtLastDate = balance;
    const today = startOfDay(params.today ?? new Date());
    const last = sorted[sorted.length - 1];
    const sinceLast = last ? daysBetween(last, today) : 0;
    balanceAsOfToday = balance - sinceLast * perDay;
  }

  return {
    dates: sorted,
    gaps,
    averageGap,
    medianGap,
    minGap,
    maxGap,
    expectedGap,
    okThreshold,
    balanceAtLastDate,
    balanceAsOfToday
  };
}
