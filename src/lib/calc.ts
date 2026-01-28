import { daysBetween, startOfDay } from './date';
import { clamp } from './number';

export type StatusKind = 'good' | 'warn' | 'bad';

export type Status = {
  kind: StatusKind;
  text: string;
};

export type SupplyMetrics = {
  daysSince: number;
  daysSupply: number;
  totalDays: number;
  runoutDate: Date;
  daysLeft: number;
  percentRemaining: number;
  percentStatus: StatusKind;
  dueStatus: Status;
};

export type CanSupply = {
  date: Date;
  daysUntilOk: number;
};

export function pickRecencyStatus(daysSince: number): Status {
  if (daysSince < 0) return { kind: 'bad', text: 'In the future (check date)' };
  if (daysSince === 0) return { kind: 'warn', text: 'Today' };
  if (daysSince <= 7) return { kind: 'good', text: 'Recent' };
  if (daysSince <= 30) return { kind: 'warn', text: 'A while ago' };
  return { kind: 'bad', text: 'Over a month ago' };
}

export function supplyDecision(daysLeft: number | null, bufferDays: number): Status {
  if (daysLeft == null) {
    return { kind: 'warn', text: 'Add tablets/day to judge supply' };
  }

  const buffer = Number.isFinite(bufferDays) ? bufferDays : 9;

  if (daysLeft < 0) {
    return { kind: 'good', text: `✅ Overdue by ${Math.abs(daysLeft)}d (OK to supply)` };
  }
  if (daysLeft <= buffer) {
    return { kind: 'good', text: `✅ Due soon (${daysLeft}d left)` };
  }
  return { kind: 'bad', text: `❌ Too early (${daysLeft}d left)` };
}

export function computeSupplyMetrics(params: {
  startDate: Date;
  amount: number;
  perDay: number;
  today?: Date;
}): SupplyMetrics {
  const today = startOfDay(params.today ?? new Date());
  const start = startOfDay(params.startDate);
  const daysSince = daysBetween(start, today);
  const daysSupply = params.amount / params.perDay;
  const totalDays = Math.max(0, Math.floor(daysSupply));
  const runoutDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + totalDays);
  const daysLeft = daysBetween(today, runoutDate);

  const used = clamp(daysBetween(start, today), 0, totalDays);
  const remaining = clamp(totalDays - used, 0, totalDays);
  const percentRemaining = totalDays > 0 ? remaining / totalDays : 0;

  let percentStatus: StatusKind = 'good';
  if (percentRemaining <= 0.15) percentStatus = 'bad';
  else if (percentRemaining <= 0.35) percentStatus = 'warn';

  let dueStatus: Status;
  if (daysLeft > 0) {
    dueStatus = { kind: 'good', text: `Not due yet (${daysLeft}d left)` };
  } else if (daysLeft === 0) {
    dueStatus = { kind: 'warn', text: 'Due today (by this estimate)' };
  } else {
    dueStatus = { kind: 'bad', text: `Overdue by ${Math.abs(daysLeft)}d (by this estimate)` };
  }

  return {
    daysSince,
    daysSupply,
    totalDays,
    runoutDate,
    daysLeft,
    percentRemaining,
    percentStatus,
    dueStatus
  };
}

export function computeCanSupplyDate(
  today: Date,
  daysLeft: number,
  bufferDays: number
): CanSupply {
  const buffer = Number.isFinite(bufferDays) ? bufferDays : 9;
  const daysUntilOk = Math.max(0, daysLeft - buffer);
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilOk);
  return { date, daysUntilOk };
}
