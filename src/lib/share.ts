export type ShareState = {
  date?: string;
  amount?: string;
  perDay?: string;
  buffer?: string;
};

export function parseShareState(search: string): ShareState {
  const params = new URLSearchParams(search);
  const state: ShareState = {};

  const s = params.get('s') || params.get('q');
  if (s) {
    const decoded = decodeURIComponent(s);
    const parts = decoded.trim().split(/\s+/);
    if (parts[0]) state.date = parts[0];
    if (parts[1]) state.amount = parts[1];
    if (parts[2]) state.perDay = parts[2];
  }

  const date = params.get('date');
  const amount = params.get('amount');
  const perDay = params.get('perDay');
  const buffer = params.get('buffer');

  if (date) state.date = date;
  if (amount) state.amount = amount;
  if (perDay) state.perDay = perDay;
  if (buffer) state.buffer = buffer;

  return state;
}

export function buildShareUrl(baseUrl: string, state: ShareState, defaultBuffer = '9'): string {
  const url = new URL(baseUrl);
  url.search = '';

  const tokens = [state.date, state.amount, state.perDay].filter(Boolean).join(' ');
  if (tokens) url.searchParams.set('s', tokens);

  if (state.buffer && state.buffer !== defaultBuffer) {
    url.searchParams.set('buffer', state.buffer);
  }

  return url.toString();
}
