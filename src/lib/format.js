export const toInt = (v) => {
  const n = Number(v);
  return v !== null && v !== '' && Number.isInteger(n) ? n : null;
};

export function fmtDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function periodLabel(start, end) {
  if (!start && !end) return 'Akses selamanya';
  if (start && end) return `${fmtDate(start)} – ${fmtDate(end)}`;
  return start ? `Mulai ${fmtDate(start)}` : `Sampai ${fmtDate(end)}`;
}

export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
