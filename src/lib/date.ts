const MS_PER_DAY = 86_400_000;

export type ParseDateResult =
  | { ok: true; date: Date; inferredYear: boolean; input: string }
  | { ok: false; error: string };

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.floor(ms / MS_PER_DAY);
}

export function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const base = new Date(year, month + months, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const clampedDay = Math.min(day, lastDay);
  return new Date(base.getFullYear(), base.getMonth(), clampedDay);
}

export function monthsAndDaysBetween(
  start: Date,
  end: Date,
): { months: number; days: number; isPast: boolean } {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  const isPast = endDay.getTime() < startDay.getTime();

  let cursor = isPast ? endDay : startDay;
  const target = isPast ? startDay : endDay;
  let months = 0;

  while (true) {
    const next = addMonthsClamped(cursor, 1);
    if (next.getTime() <= target.getTime()) {
      months += 1;
      cursor = next;
    } else {
      break;
    }
  }

  const days = daysBetween(cursor, target);
  return { months, days, isPast };
}

export function parseFlexibleDate(raw: string, today = new Date()): ParseDateResult {
  const input = (raw || '').trim();
  if (!input) return { ok: false, error: 'Enter a dispense date.' };

  let dd: number | undefined;
  let mm: number | undefined;
  let yyRaw: string | undefined;

  const compact = input.match(/^\s*(\d{4}|\d{6}|\d{8})\s*$/);
  if (compact) {
    const digits = compact[1];
    if (!digits) return { ok: false, error: 'Invalid date.' };
    dd = Number(digits.slice(0, 2));
    mm = Number(digits.slice(2, 4));
    yyRaw = digits.length > 4 ? digits.slice(4) : undefined;
  } else {
    const match = input.match(/^\s*(\d{1,2})\s*[/\-. ]\s*(\d{1,2})(?:\s*[/\-. ]\s*(\d{2,4}))?\s*$/);
    if (!match) {
      return {
        ok: false,
        error: 'Use DD/MM, DD/MM/YY, DD/MM/YYYY, or compact DDMM(YY)(YYYY).',
      };
    }
    dd = Number(match[1]);
    mm = Number(match[2]);
    yyRaw = match[3];
  }

  if (!(dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12)) {
    return { ok: false, error: 'Invalid day/month.' };
  }

  const todayStart = startOfDay(today);
  const currentYear = todayStart.getFullYear();

  let year: number;
  let inferredYear = false;

  if (!yyRaw) {
    year = currentYear;
    inferredYear = true;
    const candidate = new Date(year, mm - 1, dd);
    if (candidate.getMonth() !== mm - 1 || candidate.getDate() !== dd) {
      return { ok: false, error: 'That date does not exist.' };
    }
    if (startOfDay(candidate).getTime() > todayStart.getTime()) {
      year = currentYear - 1;
    }
  } else {
    const yNum = Number(yyRaw);
    if (yyRaw.length === 2) {
      year = 2000 + yNum;
    } else {
      year = yNum;
    }
  }

  const parsed = new Date(year, mm - 1, dd);
  if (parsed.getMonth() !== mm - 1 || parsed.getDate() !== dd) {
    return { ok: false, error: 'That date does not exist.' };
  }

  return { ok: true, date: parsed, inferredYear, input };
}

export function parseManyDates(
  text: string,
  today = new Date(),
): { dates: Date[]; errors: string[] } {
  const tokens = (text || '')
    .split(/[\n,]+/)
    .flatMap((line) => line.trim().split(/\s+/))
    .map((token) => token.trim())
    .filter(Boolean);

  const dates: Date[] = [];
  const errors: string[] = [];

  for (const token of tokens) {
    const parsed = parseFlexibleDate(token, today);
    if (parsed.ok) {
      dates.push(startOfDay(parsed.date));
    } else {
      errors.push(token);
    }
  }

  const unique = Array.from(new Map(dates.map((d) => [d.getTime(), d])).values());
  unique.sort((a, b) => a.getTime() - b.getTime());

  return { dates: unique, errors };
}
