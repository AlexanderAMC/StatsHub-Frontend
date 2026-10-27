import { addDays } from './dates';

// Devuelve un mensaje si el partido choca con otro; si no hay conflicto devuelve ''.
export function scheduleConflict(matches, candidate, ignoreId = null) {
  for (const m of matches) {
    if (m.id === ignoreId || m.date !== candidate.date) continue;
    const teamBusy = [candidate.homeId, candidate.awayId].some((id) => id === m.homeId || id === m.awayId);
    if (teamBusy) return 'Uno de los equipos ya tiene un partido ese día.';
    if (candidate.refereeId && candidate.refereeId === m.refereeId && candidate.time === m.time) {
      return 'El árbitro ya está asignado a otro partido en ese horario.';
    }
  }
  return '';
}

// Todos contra todos (método del círculo). Si hay equipos impares, uno descansa cada fecha.
export function roundRobin(teamIds) {
  const ids = [...teamIds];
  if (ids.length % 2) ids.push(null);
  const n = ids.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r += 1) {
    const pairs = [];
    for (let i = 0; i < n / 2; i += 1) {
      const a = ids[i];
      const b = ids[n - 1 - i];
      if (a !== null && b !== null) pairs.push(r % 2 ? [b, a] : [a, b]);
    }
    rounds.push(pairs);
    ids.splice(1, 0, ids.pop());
  }
  return rounds;
}

const pairKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// Genera los partidos que faltan entre los equipos del torneo, una fecha por semana.
export function buildFixture({ teams, matches, startDate, venue, referees, startRound }) {
  const existing = new Set(matches.map((m) => pairKey(m.homeId, m.awayId)));
  const slots = ['11:00', '13:00', '15:00', '17:00'];
  const created = [];
  let roundNumber = startRound;

  roundRobin(teams.map((t) => t.id)).forEach((pairs, r) => {
    const fresh = pairs.filter(([a, b]) => !existing.has(pairKey(a, b)));
    if (fresh.length === 0) return;
    roundNumber += 1;
    fresh.forEach(([homeId, awayId], i) => {
      created.push({
        round: roundNumber,
        homeId,
        awayId,
        date: addDays(startDate, 7 * r),
        time: slots[i % slots.length],
        venue,
        refereeId: referees.length ? referees[created.length % referees.length].id : null,
      });
    });
  });
  return created;
}
