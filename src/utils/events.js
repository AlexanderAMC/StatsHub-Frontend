import { BASKETBALL, EVENT_TYPES } from '../data/constants';

// Texto del historial de un partido. teamLabel y nameOf vienen del contexto de datos.
export function formatEvent(event, teamLabel, nameOf) {
  const who = event.playerId ? nameOf(event.playerId) : '';
  const assist = event.assistId ? ` (asistencia de ${nameOf(event.assistId)})` : '';
  switch (event.type) {
    case 'gol':
      return `Gol de ${teamLabel}: ${who}${assist}`;
    case 'amarilla':
      return `Tarjeta amarilla para ${who} (${teamLabel})`;
    case 'roja':
      return `Tarjeta roja para ${who} (${teamLabel})`;
    case 'sustitucion':
      return `Cambio en ${teamLabel}: sale ${who}, entra ${nameOf(event.relatedId)}`;
    case 'lesion':
      return `Lesión de ${who} (${teamLabel})`;
    case 'punto1':
      return `Tiro libre de ${who} (${teamLabel}) +1`;
    case 'punto2':
      return `Doble de ${who} (${teamLabel}) +2${assist}`;
    case 'punto3':
      return `Triple de ${who} (${teamLabel}) +3${assist}`;
    case 'rebote':
      return `Rebote de ${who} (${teamLabel})`;
    case 'falta':
      return `Falta personal de ${who} (${teamLabel})`;
    case 'tecnica':
      return `Falta técnica de ${who} (${teamLabel})`;
    case 'antideportiva':
      return `Falta antideportiva de ${who} (${teamLabel})`;
    case 'tiempo':
      return `Tiempo muerto de ${teamLabel}`;
    default:
      return EVENT_TYPES[event.type]?.label ?? '';
  }
}

// Qué hizo un jugador en un evento (para su ficha individual).
export function describePlayerEvent(event, playerId) {
  if (['gol', 'punto2', 'punto3'].includes(event.type) && event.assistId === playerId) return 'Asistencia';
  if (event.type === 'gol') return 'Gol';
  if (event.type === 'sustitucion') return event.playerId === playerId ? 'Sale por cambio' : 'Entra por cambio';
  return EVENT_TYPES[event.type]?.label ?? '';
}

export const playerInvolved = (event, playerId) =>
  event.playerId === playerId || event.assistId === playerId || event.relatedId === playerId;

// Básquetbol: faltas por jugador y eliminados (5 faltas, 2 técnicas o 2 antideportivas).
export function basketballFouls(matchEvents) {
  const fouls = new Map();
  const tech = new Map();
  const unsp = new Map();
  const out = new Set();
  const bump = (map, id) => map.set(id, (map.get(id) ?? 0) + 1);
  [...matchEvents].sort((a, b) => a.id - b.id).forEach((e) => {
    if (!EVENT_TYPES[e.type]?.foul) return;
    bump(fouls, e.playerId);
    if (e.type === 'tecnica') bump(tech, e.playerId);
    if (e.type === 'antideportiva') bump(unsp, e.playerId);
    if (fouls.get(e.playerId) >= BASKETBALL.foulOut || (tech.get(e.playerId) ?? 0) >= BASKETBALL.techOut
      || (unsp.get(e.playerId) ?? 0) >= BASKETBALL.techOut) out.add(e.playerId);
  });
  return { fouls, out };
}

// Faltas de equipo en un cuarto (desde la 5.ª, la rival tira libres).
export const teamFoulsInPeriod = (matchEvents, side, period) =>
  matchEvents.filter((e) => e.side === side && e.period === period && EVENT_TYPES[e.type]?.foul).length;
