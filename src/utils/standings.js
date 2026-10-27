// Calcula la tabla de posiciones a partir de partidos finalizados.
// 3 puntos por victoria, 1 por empate. Desempate: puntos, diferencia de gol, goles a favor, nombre.
export function computeStandings(finishedMatches) {
  const table = new Map();

  const rowFor = (team) => {
    if (!table.has(team)) {
      table.set(team, { team, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    }
    return table.get(team);
  };

  for (const { home, away, scoreHome, scoreAway } of finishedMatches) {
    const h = rowFor(home);
    const a = rowFor(away);

    h.pj += 1;
    a.pj += 1;
    h.gf += scoreHome;
    h.gc += scoreAway;
    a.gf += scoreAway;
    a.gc += scoreHome;

    if (scoreHome > scoreAway) {
      h.pg += 1;
      h.pts += 3;
      a.pp += 1;
    } else if (scoreHome < scoreAway) {
      a.pg += 1;
      a.pts += 3;
      h.pp += 1;
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
