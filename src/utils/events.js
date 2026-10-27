const CARD_LABEL = { amarilla: 'Tarjeta amarilla', roja: 'Tarjeta roja' };

export function formatEvent(event, match) {
  const team = event.team === 'home' ? match.home : match.away;
  const player = event.player ? ` (${event.player})` : '';
  const label = event.type === 'gol' ? `Gol de ${team}` : `${CARD_LABEL[event.type]} para ${team}`;
  return `${label}${player}`;
}
