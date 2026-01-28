import './style.css';

import {
  computeCanSupplyDate,
  computeSupplyMetrics,
  supplyDecision,
} from './lib/calc';
import { daysBetween, formatDate, parseFlexibleDate, parseManyDates, startOfDay } from './lib/date';
import { analyzeFrequency } from './lib/frequency';
import { parseNumber } from './lib/number';
import { parseShareState } from './lib/share';

const DEFAULT_BUFFER = 9;

const byId = <T extends HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

const dateInput = byId<HTMLInputElement>('date');
const amountInput = byId<HTMLInputElement>('amount');
const perDayInput = byId<HTMLInputElement>('perDay');
const bufferInput = byId<HTMLInputElement>('buffer');
const calcButton = byId<HTMLButtonElement>('calc');
const resetButton = byId<HTMLButtonElement>('reset');
const statusEl = byId<HTMLParagraphElement>('status');

const output = byId<HTMLDivElement>('output');
const daysValue = byId<HTMLSpanElement>('daysValue');
const parsedValue = byId<HTMLSpanElement>('parsedValue');
const daysPill = byId<HTMLSpanElement>('daysPill');
const flagPill = byId<HTMLSpanElement>('flagPill');
const canSupplyEl = byId<HTMLParagraphElement>('canSupply');
const decisionCard = byId<HTMLDivElement>('decisionCard');
const resultGrid = byId<HTMLDivElement>('resultGrid');

const medSection = byId<HTMLDivElement>('medSection');
const gaugeSection = byId<HTMLDivElement>('gaugeSection');
const daysLeftValue = byId<HTMLSpanElement>('daysLeftValue');
const runoutValue = byId<HTMLParagraphElement>('runoutValue');
const duePill = byId<HTMLSpanElement>('duePill');
const supplyPill = byId<HTMLSpanElement>('supplyPill');
const percentPill = byId<HTMLSpanElement>('percentPill');
const percentBar = byId<HTMLDivElement>('percentBar');
const medDetails = byId<HTMLUListElement>('medDetails');

const historyDates = byId<HTMLTextAreaElement>('historyDates');
const freqQty = byId<HTMLInputElement>('freqQty');
const freqPerDay = byId<HTMLInputElement>('freqPerDay');
const freqBuffer = byId<HTMLInputElement>('freqBuffer');
const freqAsOfToday = byId<HTMLInputElement>('freqAsOfToday');
const analyzeButton = byId<HTMLButtonElement>('analyze');
const freqStatus = byId<HTMLParagraphElement>('freqStatus');
const freqOutput = byId<HTMLDivElement>('freqOutput');
const freqTimeline = byId<HTMLDivElement>('freqTimeline');
const intervalsText = byId<HTMLParagraphElement>('intervalsText');

const themeToggle = byId<HTMLButtonElement>('themeToggle');

const setHidden = (el: HTMLElement | null, hidden: boolean) => {
  if (!el) return;
  el.hidden = hidden;
  el.classList.toggle('hidden', hidden);
};

const setPill = (el: HTMLElement | null, kind: 'good' | 'warn' | 'bad', text: string) => {
  if (!el) return;
  el.className = `pill pill-${kind}`;
  el.textContent = text;
};

const setStatus = (el: HTMLElement | null, text: string) => {
  if (!el) return;
  el.textContent = text;
};

const setDecisionCardTone = (kind: 'good' | 'warn' | 'bad') => {
  if (!decisionCard) return;

  decisionCard.classList.remove('decision-tone-good', 'decision-tone-warn', 'decision-tone-bad');

  if (kind === 'good') decisionCard.classList.add('decision-tone-good');
  else if (kind === 'bad') decisionCard.classList.add('decision-tone-bad');
  else decisionCard.classList.add('decision-tone-warn');
};

const renderTimeline = (dates: Date[], gaps: number[], okThreshold: number | null) => {
  if (!freqTimeline) return;
  freqTimeline.innerHTML = '';

  if (dates.length < 2) {
    setHidden(freqTimeline, true);
    return;
  }

  const title = document.createElement('div');
  title.className = 'text-sm font-semibold text-slate-700 dark:text-slate-200';
  title.textContent = 'Timeline';

  const subtitle = document.createElement('div');
  subtitle.className = 'mt-1 text-xs text-slate-500 dark:text-slate-400';
  subtitle.textContent =
    okThreshold == null
      ? 'Enter quantity + tablets/day to color early vs OK.'
      : 'Green = OK gap. Red = early (based on qty/perDay and buffer).';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const width = 1100;
  const height = 150;
  const leftPad = 24;
  const rightPad = 24;
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) {
    setHidden(freqTimeline, true);
    return;
  }

  const span = Math.max(1, daysBetween(first, last));
  const usable = width - leftPad - rightPad;
  const y = 62;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', String(height));
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Dispense timeline');

  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', String(leftPad));
  baseLine.setAttribute('x2', String(width - rightPad));
  baseLine.setAttribute('y1', String(y));
  baseLine.setAttribute('y2', String(y));
  baseLine.setAttribute('stroke', 'var(--muted)');
  baseLine.setAttribute('stroke-width', '8');
  baseLine.setAttribute('stroke-linecap', 'round');
  baseLine.setAttribute('opacity', '0.35');
  svg.appendChild(baseLine);

  const xFor = (d: Date) => leftPad + (daysBetween(first, d) / span) * usable;

  for (let i = 1; i < dates.length; i += 1) {
    const prev = dates[i - 1];
    const next = dates[i];
    if (!prev || !next) continue;

    const gap = gaps[i - 1] ?? 0;
    const isEarly = okThreshold != null && gap < okThreshold;
    const color = okThreshold == null ? '#94a3b8' : isEarly ? '#ef4444' : '#16a34a';

    const segment = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    segment.setAttribute('x1', String(xFor(prev)));
    segment.setAttribute('x2', String(xFor(next)));
    segment.setAttribute('y1', String(y));
    segment.setAttribute('y2', String(y));
    segment.setAttribute('stroke', color);
    segment.setAttribute('stroke-width', '8');
    segment.setAttribute('stroke-linecap', 'round');
    svg.appendChild(segment);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String((xFor(prev) + xFor(next)) / 2));
    label.setAttribute('y', String(y - 10));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '13');
    label.setAttribute('fill', 'var(--muted)');
    label.textContent = isEarly && okThreshold != null ? `EARLY (${gap}d)` : `${gap}d`;
    svg.appendChild(label);
  }

  for (const date of dates) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(xFor(date)));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '9');
    dot.setAttribute('fill', 'var(--fg)');
    dot.setAttribute('stroke', 'var(--bg)');
    dot.setAttribute('stroke-width', '2');
    svg.appendChild(dot);
  }

  const firstLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  firstLabel.setAttribute('x', String(leftPad));
  firstLabel.setAttribute('y', String(height - 10));
  firstLabel.setAttribute('font-size', '12');
  firstLabel.setAttribute('fill', 'var(--muted)');
  firstLabel.textContent = formatDate(first);
  svg.appendChild(firstLabel);

  const lastLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  lastLabel.setAttribute('x', String(width - rightPad));
  lastLabel.setAttribute('y', String(height - 10));
  lastLabel.setAttribute('font-size', '12');
  lastLabel.setAttribute('text-anchor', 'end');
  lastLabel.setAttribute('fill', 'var(--muted)');
  lastLabel.textContent = formatDate(last);
  svg.appendChild(lastLabel);

  freqTimeline.append(title, subtitle, svg);
  setHidden(freqTimeline, false);
};

const computeAndRender = () => {
  if (!dateInput || !amountInput || !perDayInput || !bufferInput) return;
  if (!output || !daysValue || !parsedValue || !daysPill || !flagPill || !canSupplyEl) return;

  const dateRaw = dateInput.value;
  const parseResult = parseFlexibleDate(dateRaw);
  if (!parseResult.ok) {
    setStatus(statusEl, parseResult.error);
    setHidden(output, true);
    return;
  }

  const today = startOfDay(new Date());
  const startDate = startOfDay(parseResult.date);
  const daysSince = daysBetween(startDate, today);
  daysValue.textContent = String(daysSince);
  daysPill.textContent = `${daysSince} days`;
  parsedValue.textContent = `Parsed as ${formatDate(startDate)}${
    parseResult.inferredYear ? ' (year inferred)' : ''
  }`;

  const amount = parseNumber(amountInput.value);
  const perDay = parseNumber(perDayInput.value);
  const buffer = parseNumber(bufferInput.value) ?? DEFAULT_BUFFER;

  if (amount != null && perDay != null && perDay > 0 && medSection && gaugeSection) {
    setHidden(decisionCard, false);
    resultGrid?.classList.remove('single-card');
    const metrics = computeSupplyMetrics({ startDate, amount, perDay, today });

    if (daysLeftValue && runoutValue) {
      daysLeftValue.textContent = String(metrics.daysLeft);
      runoutValue.textContent = `Run-out date: ${formatDate(metrics.runoutDate)}`;
    }

    setPill(duePill, metrics.dueStatus.kind, metrics.dueStatus.text);
    setPill(
      supplyPill,
      'good',
      `~${metrics.daysSupply.toFixed(metrics.daysSupply < 10 ? 1 : 0)} days supply`,
    );

    if (percentBar) {
      percentBar.style.width = `${Math.round(metrics.percentRemaining * 100)}%`;
    }
    setPill(
      percentPill,
      metrics.percentStatus,
      `${Math.round(metrics.percentRemaining * 100)}% remaining`,
    );

    if (medDetails) {
      medDetails.innerHTML = '';
      const items = [
        `Start date: ${formatDate(startDate)}`,
        `Amount: ${amount} tablets`,
        `Rate: ${perDay} tablets/day`,
        `Estimated run-out: ${formatDate(metrics.runoutDate)}`,
      ];
      items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        medDetails.appendChild(li);
      });
    }

    const decision = supplyDecision(metrics.daysLeft, buffer);
    setPill(flagPill, decision.kind, decision.text);
    setDecisionCardTone(decision.kind);

    const { date, daysUntilOk } = computeCanSupplyDate(today, metrics.daysLeft, buffer);
    canSupplyEl.textContent =
      daysUntilOk === 0
        ? 'Can supply: today'
        : `Can supply on: ${formatDate(date)} (in ${daysUntilOk}d)`;

    setHidden(medSection, false);
    setHidden(gaugeSection, false);
  } else {
    setHidden(decisionCard, true);
    resultGrid?.classList.add('single-card');
    setHidden(medSection, true);
    setHidden(gaugeSection, true);
  }

  setHidden(output, false);
  setStatus(statusEl, '');
};

const analyzeAndRender = () => {
  if (!historyDates || !freqOutput || !freqStatus || !intervalsText) return;

  const today = new Date();
  const { dates, errors } = parseManyDates(historyDates.value, today);

  if (errors.length) {
    setStatus(
      freqStatus,
      `Could not parse: ${errors.slice(0, 5).join(', ')}${
        errors.length > 5 ? ` +${errors.length - 5} more` : ''
      }`,
    );
  } else {
    setStatus(freqStatus, '');
  }

  if (dates.length < 2) {
    setHidden(freqOutput, true);
    setHidden(freqTimeline, true);
    setStatus(freqStatus, freqStatus.textContent || 'Add at least 2 dates.');
    return;
  }

  const qty = parseNumber(freqQty?.value ?? '');
  const perDay = parseNumber(freqPerDay?.value ?? '');
  const buffer = parseNumber(freqBuffer?.value ?? '') ?? DEFAULT_BUFFER;

  const analysis = analyzeFrequency({
    dates,
    qty,
    perDay,
    bufferDays: buffer,
    today,
  });

  freqOutput.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'text-sm font-semibold text-slate-700 dark:text-slate-200';
  title.textContent = 'Dispense frequency summary';

  const list = document.createElement('ul');
  list.className = 'mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200';

  const first = analysis.dates[0];
  const last = analysis.dates[analysis.dates.length - 1];
  if (!first || !last) {
    setHidden(freqOutput, true);
    setHidden(freqTimeline, true);
    setStatus(freqStatus, 'Add at least 2 dates.');
    return;
  }

  const baseItems = [
    `Dates: ${analysis.dates.length} (${formatDate(first)} → ${formatDate(last)})`,
    `Intervals: ${analysis.gaps.length} gaps`,
    `Average gap: ${analysis.averageGap.toFixed(1)} days`,
    `Median gap: ${analysis.medianGap.toFixed(1)} days`,
    `Range: ${analysis.minGap}–${analysis.maxGap} days`,
  ];

  baseItems.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });

  if (analysis.expectedGap != null) {
    const li = document.createElement('li');
    li.textContent = `Expected gap: ${analysis.expectedGap.toFixed(1)} days (qty/perDay)`;
    list.appendChild(li);

    const li2 = document.createElement('li');
    li2.textContent = `Early threshold: < ${analysis.okThreshold?.toFixed(1)} days = early`;
    list.appendChild(li2);
  }

  if (analysis.balanceAtLastDate != null) {
    const li = document.createElement('li');
    const balancePill = document.createElement('span');
    balancePill.className =
      analysis.balanceAtLastDate >= 0 ? 'pill pill-good ml-2' : 'pill pill-bad ml-2';
    balancePill.textContent = analysis.balanceAtLastDate.toFixed(0);
    li.textContent = 'Net tablets (est.) at last dispense date:';
    li.appendChild(balancePill);
    list.appendChild(li);

    const note = document.createElement('li');
    note.className = 'text-xs text-slate-500 dark:text-slate-400';
    note.textContent = 'Assumes only the supplies listed (starting balance = 0 at first date).';
    list.appendChild(note);

    if (freqAsOfToday?.checked && analysis.balanceAsOfToday != null) {
      const li2 = document.createElement('li');
      const pill = document.createElement('span');
      pill.className =
        analysis.balanceAsOfToday >= 0 ? 'pill pill-good ml-2' : 'pill pill-bad ml-2';
      pill.textContent = analysis.balanceAsOfToday.toFixed(0);
      li2.textContent = 'Projected net tablets today:';
      li2.appendChild(pill);
      list.appendChild(li2);
    }
  }

  freqOutput.append(title, list);
  intervalsText.textContent = `Intervals used: ${analysis.gaps.join(', ')} days`;

  renderTimeline(analysis.dates, analysis.gaps, analysis.okThreshold);
  setHidden(freqOutput, false);
};

const fillFromQuery = () => {
  if (!dateInput || !amountInput || !perDayInput || !bufferInput) return;

  const state = parseShareState(window.location.search);
  if (state.date) dateInput.value = state.date;
  if (state.amount) amountInput.value = state.amount;
  if (state.perDay) perDayInput.value = state.perDay;
  if (state.buffer) bufferInput.value = state.buffer;

  if (dateInput.value.trim()) {
    computeAndRender();
  }
};

const resetAll = () => {
  if (!dateInput || !amountInput || !perDayInput || !bufferInput) return;

  dateInput.value = '';
  amountInput.value = '';
  perDayInput.value = '';
  bufferInput.value = '';

  if (historyDates) historyDates.value = '';
  if (freqQty) freqQty.value = '';
  if (freqPerDay) freqPerDay.value = '';
  if (freqBuffer) freqBuffer.value = '';
  if (freqAsOfToday) freqAsOfToday.checked = true;

  setHidden(output, true);
  setHidden(freqOutput, true);
  setHidden(freqTimeline, true);

  if (statusEl) statusEl.textContent = '';
  if (freqStatus) freqStatus.textContent = '';
  if (intervalsText) intervalsText.textContent = '';
};

const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');

  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
};

const initTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    applyTheme(stored);
  } else {
    applyTheme('light');
  }
};

calcButton?.addEventListener('click', computeAndRender);
analyzeButton?.addEventListener('click', analyzeAndRender);
resetButton?.addEventListener('click', resetAll);

bufferInput?.addEventListener('blur', computeAndRender);
bufferInput?.addEventListener('change', computeAndRender);

historyDates?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    analyzeAndRender();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const active = document.activeElement;
    const isTextarea = active?.tagName === 'TEXTAREA';
    if (!isTextarea) computeAndRender();
  }
});

themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

initTheme();
fillFromQuery();
