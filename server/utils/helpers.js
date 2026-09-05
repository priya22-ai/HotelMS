export function clean(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 500);
}

export function toInt(v, fallback = 0) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function toDateStr(d) {
  if (!d) return null;
  // accept YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}
