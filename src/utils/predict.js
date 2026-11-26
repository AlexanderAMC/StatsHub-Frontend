// Modelo base de predicción: goles esperados de cada equipo según su ataque y defensa
// en el torneo (distribución de Poisson). Es una estimación estadística, no una certeza.
const MAX_GOALS = 8;
const SMOOTHING = 2;
const HOME_ADVANTAGE = 1.1;

function poisson(k, lambda) {
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i += 1) p *= lambda / i;
  return p;
}

// Básquetbol: puntos con distribución normal y sin empate (se juega prórroga).
const BASKET_HOME_POINTS = 3;
const BASKET_SD = 11;
function normalCdf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t
    * Math.exp(-(x * x) / 2);
  return x >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

export function predictMatch(homeId, awayId, finishedMatches, sport) {
  if (finishedMatches.length === 0) return null;
  const basket = sport === 'BASQUETBOL';

  const table = new Map();
  const row = (id) => {
    if (!table.has(id)) table.set(id, { gf: 0, gc: 0, games: 0 });
    return table.get(id);
  };
  let totalGoals = 0;
  for (const m of finishedMatches) {
    const h = row(m.homeId);
    const a = row(m.awayId);
    h.gf += m.scoreHome;
    h.gc += m.scoreAway;
    a.gf += m.scoreAway;
    a.gc += m.scoreHome;
    h.games += 1;
    a.games += 1;
    totalGoals += m.scoreHome + m.scoreAway;
  }

  const league = totalGoals / (finishedMatches.length * 2) || 1;
  const strength = (id) => {
    const s = table.get(id) ?? { gf: 0, gc: 0, games: 0 };
    return {
      attack: (s.gf + league * SMOOTHING) / (s.games + SMOOTHING) / league,
      defense: (s.gc + league * SMOOTHING) / (s.games + SMOOTHING) / league,
      games: s.games,
    };
  };

  const h = strength(homeId);
  const a = strength(awayId);
  const minGames = Math.min(h.games, a.games);
  const confidence = minGames < 3 ? 'Baja' : minGames < 6 ? 'Media' : 'Alta';
  if (basket) {
    const expectedHome = league * h.attack * a.defense + BASKET_HOME_POINTS / 2;
    const expectedAway = league * a.attack * h.defense - BASKET_HOME_POINTS / 2;
    const home = normalCdf((expectedHome - expectedAway) / (BASKET_SD * Math.SQRT2));
    return { home, draw: 0, away: 1 - home, expectedHome, expectedAway, confidence };
  }
  const lambdaHome = Math.max(0.2, league * h.attack * a.defense * HOME_ADVANTAGE);
  const lambdaAway = Math.max(0.2, (league * a.attack * h.defense) / HOME_ADVANTAGE);

  let home = 0;
  let draw = 0;
  let away = 0;
  for (let i = 0; i <= MAX_GOALS; i += 1) {
    for (let j = 0; j <= MAX_GOALS; j += 1) {
      const p = poisson(i, lambdaHome) * poisson(j, lambdaAway);
      if (i > j) home += p;
      else if (i === j) draw += p;
      else away += p;
    }
  }
  const total = home + draw + away;

  return {
    home: home / total,
    draw: draw / total,
    away: away / total,
    expectedHome: lambdaHome,
    expectedAway: lambdaAway,
    confidence,
  };
}
