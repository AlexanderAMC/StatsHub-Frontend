import { EVENT_TYPES, MATCH_STATUS, isBasketball } from '../data/constants';
import { byDateTime } from './dates';

const emptyRow = (team) => ({ teamId: team.id, team: team.name, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });

// Fútbol: 3 puntos por victoria, 1 por empate. Básquetbol (FIBA): 2 por victoria, 1 por derrota.
// Desempate: puntos, diferencia, tantos a favor, nombre.
export function computeStandings(teams, finishedMatches, sport) {
  const basket = isBasketball(sport);
  const win = basket ? 2 : 3;
  const loss = basket ? 1 : 0;
  const table = new Map(teams.map((t) => [t.id, emptyRow(t)]));

  for (const { homeId, awayId, scoreHome, scoreAway } of finishedMatches) {
    const h = table.get(homeId);
    const a = table.get(awayId);
    if (!h || !a) continue;

    h.pj += 1;
    a.pj += 1;
    h.gf += scoreHome;
    h.gc += scoreAway;
    a.gf += scoreAway;
    a.gc += scoreHome;

    if (scoreHome > scoreAway) {
      h.pg += 1;
      h.pts += win;
      a.pp += 1;
      a.pts += loss;
    } else if (scoreHome < scoreAway) {
      a.pg += 1;
      a.pts += win;
      h.pp += 1;
      h.pts += loss;
    } else {
      h.pe += 1;
      a.pe += 1;
      h.pts += 1;
      a.pts += 1;
    }
  }

  return [...table.values()]
    .map((row) => ({ ...row, dg: row.gf - row.gc }))
    .sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.team.localeCompare(y.team));
}

function resultFor(teamId, match) {
  const own = match.homeId === teamId ? match.scoreHome : match.scoreAway;
  const opp = match.homeId === teamId ? match.scoreAway : match.scoreHome;
  if (own > opp) return 'G';
  if (own < opp) return 'P';
  return 'E';
}

const resultsOf = (teamId, finishedMatches) =>
  finishedMatches
    .filter((m) => m.homeId === teamId || m.awayId === teamId)
    .sort(byDateTime)
    .map((m) => resultFor(teamId, m));

// Últimos resultados: G (ganó), E (empató), P (perdió).
export const teamForm = (teamId, finishedMatches, limit = 5) => resultsOf(teamId, finishedMatches).slice(-limit);

// Compara los puntos por partido de los últimos 3 con el promedio de toda la temporada.
export function teamTrend(teamId, finishedMatches, sport) {
  const results = resultsOf(teamId, finishedMatches);
  if (results.length < 4) return 'Sin datos';
  const basket = isBasketball(sport);
  const points = (r) => (r === 'G' ? (basket ? 2 : 3) : r === 'E' || (basket && r === 'P') ? 1 : 0);
  const average = (list) => list.reduce((sum, r) => sum + points(r), 0) / list.length;
  const diff = average(results.slice(-3)) - average(results);
  if (diff > 0.3) return 'Al alza';
  if (diff < -0.3) return 'A la baja';
  return 'Estable';
}

// Partidos jugados = convocados en el acta o que entraron por sustitución.
export function computePlayerStats(players, matches, events) {
  const stats = new Map(players.map((p) => [p.id, { pj: 0, goles: 0, asistencias: 0, amarillas: 0, rojas: 0, puntos: 0, triples: 0, rebotes: 0, faltas: 0 }]));
  const played = matches.filter((m) => m.status !== MATCH_STATUS.SCHEDULED);
  const participants = new Map(
    played.map((m) => [m.id, new Set([...(m.lineup?.home ?? []), ...(m.lineup?.away ?? [])])]),
  );

  for (const e of events) {
    const set = participants.get(e.matchId);
    if (!set) continue;
    if (e.type === 'sustitucion' && e.relatedId) set.add(e.relatedId);
    const own = stats.get(e.playerId);
    if (e.type === 'gol') {
      if (own) own.goles += 1;
      const helper = stats.get(e.assistId);
      if (helper) helper.asistencias += 1;
    }
    if (['punto1', 'punto2', 'punto3'].includes(e.type)) {
      if (own) {
        own.puntos += EVENT_TYPES[e.type].points;
        if (e.type === 'punto3') own.triples += 1;
      }
      const helper = stats.get(e.assistId);
      if (helper) helper.asistencias += 1;
    }
    if (e.type === 'rebote' && own) own.rebotes += 1;
    if (EVENT_TYPES[e.type]?.foul && own) own.faltas += 1;
    if (e.type === 'amarilla' && own) own.amarillas += 1;
    if (e.type === 'roja' && own) own.rojas += 1;
  }

  participants.forEach((set) =>
    set.forEach((id) => {
      const s = stats.get(id);
      if (s) s.pj += 1;
    }),
  );
  return stats;
}
