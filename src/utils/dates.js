// Las fechas del sistema viajan como texto ISO (AAAA-MM-DD) y la hora como HH:MM.
const parse = (iso) => new Date(`${iso}T12:00:00`);

export const formatDate = (iso) => {
  const text = parse(iso).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDateShort = (iso) =>
  parse(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (isoDateTime) =>
  new Date(isoDateTime).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

export const addDays = (iso, days) => {
  const date = parse(iso);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Solo debe llamarse dentro de manejadores de eventos, nunca al renderizar.
export const todayIso = () => addDays(new Date().toISOString().slice(0, 10), 0);

export const byDateTime = (a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
