import { EVENT_TYPES } from '../data/constants';

// Texto del historial de un partido. teamLabel y nameOf vienen del contexto de datos.
export function formatEvent(event, teamLabel, nameOf) {
  const who = event.playerId ? nameOf(event.playerId) : '';
  switch (event.type) {
    case 'gol':
      return `Gol de ${teamLabel}: ${who}${event.assistId ? ` (asistencia de ${nameOf(event.assistId)})` : ''}`;
    case 'amarilla':
      return `Tarjeta amarilla para ${who} (${teamLabel})`;
    case 'roja':
      return `Tarjeta roja para ${who} (${teamLabel})`;
    case 'sustitucion':
      return `Sustitución en ${teamLabel}: sale ${who}, entra ${nameOf(event.relatedId)}`;
    case 'lesion':
      return `Lesión de ${who} (${teamLabel})`;
    default:
      return EVENT_TYPES[event.type]?.label ?? '';
  }
}

// Qué hizo un jugador en un evento (para su ficha individual).
export function describePlayerEvent(event, playerId) {
  if (event.type === 'gol') return event.playerId === playerId ? 'Gol' : 'Asistencia';
  if (event.type === 'sustitucion') return event.playerId === playerId ? 'Sale por sustitución' : 'Entra por sustitución';
  return EVENT_TYPES[event.type]?.label ?? '';
}

export const playerInvolved = (event, playerId) =>
  event.playerId === playerId || event.assistId === playerId || event.relatedId === playerId;
