import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ExportButtons from '../components/ExportButtons';
import { MATCH_STATUS, SPORT_LABELS, isBasketball } from '../data/constants';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { downloadCsv } from '../utils/csv';
import { byDateTime, formatDateShort } from '../utils/dates';
import { predictMatch } from '../utils/predict';
import { computePlayerStats, computeStandings, teamForm, teamTrend } from '../utils/stats';

const VIEWS = [
  { id: 'posiciones', label: 'Posiciones' },
  { id: 'goleadores', label: 'Goleadores', basketLabel: 'Anotadores', perm: 'estadisticas:avanzadas' },
  { id: 'asistencias', label: 'Asistencias', perm: 'estadisticas:avanzadas' },
  { id: 'rebotes', label: 'Rebotes', perm: 'estadisticas:avanzadas', basketOnly: true },
  { id: 'rendimiento', label: 'Rendimiento', perm: 'estadisticas:avanzadas' },
  { id: 'fairplay', label: 'Fair Play', basketLabel: 'Faltas', perm: 'estadisticas:avanzadas' },
  { id: 'prediccion', label: 'Predicción', perm: 'analitica:predictiva' },
];

// RF-35: ranking de Fair Play (amarilla = 1 punto, roja = 3). Menos puntos = mejor posición.
// Básquetbol: falta personal = 1 punto, técnica o antideportiva = 2.
function FairPlayTable({ rows, basket }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle border">
        <thead className="table-light">
          {basket
            ? <tr><th>#</th><th>Equipo</th><th className="text-center">Personales</th><th className="text-center">Técnicas y antideportivas</th><th className="text-center">Puntos</th></tr>
            : <tr><th>#</th><th>Equipo</th><th className="text-center">Amarillas</th><th className="text-center">Rojas</th><th className="text-center">Puntos</th></tr>}
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.teamId}>
              <td className="fw-bold">{i + 1}</td>
              <td className="fw-semibold text-dark">{r.team}</td>
              <td className="text-center"><span className="badge bg-warning text-dark">{r.yellow}</span></td>
              <td className="text-center"><span className="badge bg-danger">{r.red}</span></td>
              <td className="text-center fw-bold">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const FORM_BADGE = { G: 'bg-success', E: 'bg-secondary', P: 'bg-danger' };
const TREND_STYLE = { 'Al alza': 'text-success', 'A la baja': 'text-danger', Estable: 'text-secondary', 'Sin datos': 'text-muted' };
const pct = (p) => Math.round(p * 100);
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const STANDING_COLUMNS = [
  { key: 'pj', label: 'PJ', title: 'Partidos jugados' },
  { key: 'pg', label: 'PG', title: 'Partidos ganados' },
  { key: 'pe', label: 'PE', title: 'Partidos empatados' },
  { key: 'pp', label: 'PP', title: 'Partidos perdidos' },
  { key: 'gf', label: 'GF', title: 'Goles a favor' },
  { key: 'gc', label: 'GC', title: 'Goles en contra' },
  { key: 'dg', label: 'DG', title: 'Diferencia de gol' },
];

const BASKET_COLUMNS = [
  { key: 'pj', label: 'PJ', title: 'Partidos jugados' },
  { key: 'pg', label: 'PG', title: 'Partidos ganados' },
  { key: 'pp', label: 'PP', title: 'Partidos perdidos' },
  { key: 'gf', label: 'PF', title: 'Puntos a favor' },
  { key: 'gc', label: 'PC', title: 'Puntos en contra' },
  { key: 'dg', label: 'DIF', title: 'Diferencia de puntos' },
];

function StandingsTable({ rows, basket }) {
  const columns = basket ? BASKET_COLUMNS : STANDING_COLUMNS;
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle border">
        <thead className="table-dark" style={{ '--bs-table-bg': '#1E0A3C', '--bs-table-color': '#fff' }}>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Equipo</th>
            {columns.map((c) => <th key={c.key} scope="col" className="text-center" title={c.title}>{c.label}</th>)}
            <th scope="col" className="text-center" title="Puntos">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.teamId}>
              <td className={`fw-bold ${i === 0 && row.pj > 0 ? 'text-warning' : ''}`}>{i + 1}</td>
              <td><Link to={`/equipos/${row.teamId}`} className="fw-bold text-dark text-decoration-none">{row.team}</Link></td>
              {columns.map((c) => (
                <td key={c.key} className="text-center">{c.key === 'dg' && row.dg > 0 ? `+${row.dg}` : row[c.key]}</td>
              ))}
              <td className="text-center fw-bold text-dark fs-6">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeaderTable({ rows, valueKey, valueLabel, teamName }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <div className="table-responsive">
      <table className="table align-middle border">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Equipo</th>
            <th className="text-center" title="Partidos jugados">PJ</th>
            <th style={{ minWidth: '180px' }}>{valueLabel}</th>
            <th className="text-center">Por partido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.player.id}>
              <td className="fw-bold">{i + 1}</td>
              <td><Link to={`/jugadores/${r.player.id}`} className="fw-semibold text-decoration-none">{r.player.name}</Link></td>
              <td className="text-secondary">{teamName(r.player.teamId)}</td>
              <td className="text-center">{r.pj}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-dark" style={{ width: '1.5rem' }}>{r[valueKey]}</span>
                  <div className="progress flex-grow-1" style={{ height: '8px' }} role="img" aria-label={`${r[valueKey]} ${valueLabel.toLowerCase()}`}>
                    <div className="progress-bar bg-warning" style={{ width: `${(r[valueKey] / max) * 100}%` }} />
                  </div>
                </div>
              </td>
              <td className="text-center">{r.pj ? (r[valueKey] / r.pj).toFixed(2) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PerformanceTable({ rows, basket }) {
  // Básquetbol: efectividad = porcentaje de victorias (la derrota también suma 1 punto en la tabla).
  const effectiveness = (r) => (r.pj ? pct(basket ? r.pg / r.pj : r.pts / (3 * r.pj)) : 0);
  return (
    <div className="table-responsive">
      <table className="table align-middle border">
        <thead className="table-light">
          <tr>
            <th>Equipo</th>
            <th className="text-center" title="Partidos jugados">PJ</th>
            <th className="text-center" title={basket ? 'Puntos a favor por partido' : 'Goles a favor por partido'}>{basket ? 'PF/PJ' : 'GF/PJ'}</th>
            <th className="text-center" title={basket ? 'Puntos en contra por partido' : 'Goles en contra por partido'}>{basket ? 'PC/PJ' : 'GC/PJ'}</th>
            <th style={{ minWidth: '170px' }} title="Puntos obtenidos sobre los posibles">Efectividad</th>
            <th>Forma</th>
            <th>Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.teamId}>
              <td className="fw-bold text-dark">{r.team}</td>
              <td className="text-center">{r.pj}</td>
              <td className="text-center">{r.pj ? (r.gf / r.pj).toFixed(2) : '-'}</td>
              <td className="text-center">{r.pj ? (r.gc / r.pj).toFixed(2) : '-'}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-dark" style={{ width: '2.8rem' }}>{r.pj ? `${effectiveness(r)}%` : '-'}</span>
                  <div className="progress flex-grow-1" style={{ height: '8px' }} role="img" aria-label="Efectividad">
                    <div className="progress-bar" style={{ width: `${effectiveness(r)}%`, backgroundColor: '#1E0A3C' }} />
                  </div>
                </div>
              </td>
              <td>{r.form.length === 0 ? '-' : r.form.map((f, i) => <span key={i} className={`badge ${FORM_BADGE[f]} me-1`}>{f}</span>)}</td>
              <td className={`fw-semibold ${TREND_STYLE[r.trend]}`}>{r.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PredictionTable({ items, teamName, basket }) {
  return (
    <>
      <div className="table-responsive">
        <table className="table align-middle border">
          <thead className="table-light">
            <tr>
              <th>Partido</th>
              <th style={{ minWidth: '260px' }}>Probabilidad estimada</th>
              <th className="text-center" title={basket ? 'Puntos esperados de cada equipo' : 'Goles esperados de cada equipo'}>{basket ? 'Puntos esperados' : 'Goles esperados'}</th>
              <th className="text-center">Confianza</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ match, prediction }) => (
              <tr key={match.id}>
                <td>
                  <span className="fw-bold text-dark d-block">{teamName(match.homeId)} vs {teamName(match.awayId)}</span>
                  <span className="small text-muted">{formatDateShort(match.date)}, {match.time}</span>
                </td>
                <td>
                  <div className="progress" style={{ height: '10px' }} role="img" aria-label={basket ? `Local ${pct(prediction.home)}%, visita ${pct(prediction.away)}%` : `Local ${pct(prediction.home)}%, empate ${pct(prediction.draw)}%, visita ${pct(prediction.away)}%`}>
                    <div className="progress-bar" style={{ width: `${prediction.home * 100}%`, backgroundColor: '#1E0A3C' }} />
                    <div className="progress-bar bg-secondary" style={{ width: `${prediction.draw * 100}%` }} />
                    <div className="progress-bar bg-warning" style={{ width: `${prediction.away * 100}%` }} />
                  </div>
                  <span className="small text-muted">{basket ? `Local ${pct(prediction.home)}%, visita ${pct(prediction.away)}% (sin empate: se juega prórroga)` : `Local ${pct(prediction.home)}%, empate ${pct(prediction.draw)}%, visita ${pct(prediction.away)}%`}</span>
                </td>
                <td className="text-center">{prediction.expectedHome.toFixed(1)} - {prediction.expectedAway.toFixed(1)}</td>
                <td className="text-center">{prediction.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small text-muted mb-0">
        {basket ? 'Modelo estadístico de puntos (distribución normal)' : 'Modelo estadístico base (distribución de Poisson)'} calculado con el ataque y la defensa de cada equipo en el torneo. Es una estimación
        para apoyar el análisis, no una garantía. Con más partidos jugados, la confianza aumenta.
      </p>
    </>
  );
}

export default function Estadisticas() {
  const { tournaments, teams, players, matches, events, predictions, teamName } = useData();
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();

  // Pestañas según el plan del usuario: sin plan solo Posiciones (sin candados: lo demás no aparece).
  const requestedId = Number(params.get('torneo'));
  const selected = tournaments.find((t) => t.id === requestedId) ?? tournaments.find((t) => t.status === 'En Curso') ?? tournaments[0];
  const sport = selected?.sport;
  const basket = isBasketball(sport);
  const views = VIEWS
    .filter((v) => (!v.perm || can(v.perm)) && (!v.basketOnly || basket))
    .map((v) => ({ ...v, label: basket && v.basketLabel ? v.basketLabel : v.label }));
  const view = views.find((v) => v.id === params.get('vista'))?.id ?? 'posiciones';
  const tournamentId = selected?.id;
  const seasons = [...new Set(tournaments.map((t) => t.season))].sort().reverse();

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => next.set(key, String(value)));
    setParams(next, { replace: true });
  };

  const tTeams = useMemo(() => teams.filter((t) => t.tournamentId === tournamentId), [teams, tournamentId]);
  const tMatches = useMemo(() => matches.filter((m) => m.tournamentId === tournamentId), [matches, tournamentId]);
  const finished = useMemo(() => tMatches.filter((m) => m.status === MATCH_STATUS.FINISHED), [tMatches]);
  const standings = useMemo(() => computeStandings(tTeams, finished, sport), [tTeams, finished, sport]);
  const playerStats = useMemo(() => computePlayerStats(players, tMatches, events), [players, tMatches, events]);

  const leaders = (key) =>
    players
      .map((player) => ({ player, ...playerStats.get(player.id) }))
      .filter((r) => r[key] > 0)
      .sort((a, b) => b[key] - a[key] || a.pj - b.pj || a.player.name.localeCompare(b.player.name));
  const scorerKey = basket ? 'puntos' : 'goles';
  const scorers = useMemo(() => leaders(scorerKey), [players, playerStats, scorerKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const rebounders = useMemo(() => leaders('rebotes'), [players, playerStats]); // eslint-disable-line react-hooks/exhaustive-deps
  const assisters = useMemo(() => leaders('asistencias'), [players, playerStats]); // eslint-disable-line react-hooks/exhaustive-deps

  const performance = useMemo(
    () => standings.map((row) => ({ ...row, form: teamForm(row.teamId, finished), trend: teamTrend(row.teamId, finished, sport) })),
    [standings, finished, sport],
  );
  const fairPlay = useMemo(() => {
    const table = new Map(tTeams.map((t) => [t.id, { teamId: t.id, team: t.name, yellow: 0, red: 0 }]));
    const byMatch = new Map(tMatches.map((m) => [m.id, m]));
    for (const e of events) {
      const m = byMatch.get(e.matchId);
      // Fútbol: amarilla / roja. Básquetbol: personal (yellow) / técnica o antideportiva (red).
      const light = e.type === 'amarilla' || e.type === 'falta';
      const heavy = e.type === 'roja' || e.type === 'tecnica' || e.type === 'antideportiva';
      if (!m || (!light && !heavy)) continue;
      const row = table.get(e.side === 'home' ? m.homeId : m.awayId);
      if (row) row[light ? 'yellow' : 'red'] += 1;
    }
    return [...table.values()]
      .map((r) => ({ ...r, points: r.yellow + (isBasketball(sport) ? 2 : 3) * r.red }))
      .sort((a, b) => a.points - b.points || a.team.localeCompare(b.team));
  }, [tTeams, tMatches, events, sport]);

  // RF-37: predicción del modelo de Machine Learning del servidor; si no está, cálculo local.
  const upcoming = useMemo(
    () =>
      tMatches
        .filter((m) => m.status === MATCH_STATUS.SCHEDULED)
        .sort(byDateTime)
        .map((match) => ({ match, prediction: predictions[match.id] ?? predictMatch(match.homeId, match.awayId, finished, sport) }))
        .filter((item) => item.prediction),
    [tMatches, finished, predictions, sport],
  );

  if (!selected) {
    return (
      <div className="card border-0 shadow-sm rounded-3 bg-white">
        <EmptyState title="Aún no hay torneos">Crea un torneo para ver sus estadísticas.</EmptyState>
      </div>
    );
  }

  const exportCsv = () => {
    const file = `${slug(selected.name)}-${view}.csv`;
    if (view === 'posiciones') {
      downloadCsv(file, ['Pos', 'Equipo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'PTS'], standings.map((r, i) => [i + 1, r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.dg, r.pts]));
    } else if (view === 'goleadores' || view === 'asistencias' || view === 'rebotes') {
      const key = view === 'goleadores' ? scorerKey : view;
      const label = { puntos: 'Puntos', goles: 'Goles', asistencias: 'Asistencias', rebotes: 'Rebotes' }[key];
      downloadCsv(file, ['Pos', 'Jugador', 'Equipo', 'PJ', label], leaders(key).map((r, i) => [i + 1, r.player.name, teamName(r.player.teamId), r.pj, r[key]]));
    } else if (view === 'rendimiento') {
      downloadCsv(file, ['Equipo', 'PJ', 'GF por partido', 'GC por partido', 'Efectividad %', 'Forma', 'Tendencia'], performance.map((r) => [r.team, r.pj, r.pj ? (r.gf / r.pj).toFixed(2) : 0, r.pj ? (r.gc / r.pj).toFixed(2) : 0, r.pj ? pct(r.pts / (3 * r.pj)) : 0, r.form.join(''), r.trend]));
    } else {
      downloadCsv(file, ['Fecha', 'Local', 'Visita', 'Prob. local %', 'Prob. empate %', 'Prob. visita %', 'Confianza'], upcoming.map(({ match, prediction }) => [match.date, teamName(match.homeId), teamName(match.awayId), pct(prediction.home), pct(prediction.draw), pct(prediction.away), prediction.confidence]));
    }
  };

  const liveCount = tMatches.filter((m) => m.status === MATCH_STATUS.LIVE).length;
  const tournamentsOfSeason = tournaments.filter((t) => t.season === selected.season);

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>Posiciones y analítica</h2>
          <p className="text-muted small mb-0">{selected.name} · {SPORT_LABELS[sport] ?? ''}. Temporada {selected.season}.</p>
        </div>
        <ExportButtons onCsv={exportCsv} />
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3 no-print">
        <select className="form-select form-select-sm w-auto" aria-label="Temporada" value={selected.season} onChange={(e) => update({ torneo: tournaments.find((t) => t.season === e.target.value).id })}>
          {seasons.map((s) => <option key={s} value={s}>Temporada {s}</option>)}
        </select>
        <select className="form-select form-select-sm w-auto" aria-label="Torneo" value={selected.id} onChange={(e) => update({ torneo: e.target.value })}>
          {tournamentsOfSeason.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <ul className="nav nav-tabs mb-3 no-print" role="tablist">
        {views.map((v) => (
          <li className="nav-item" key={v.id} role="presentation">
            <button type="button" role="tab" aria-selected={view === v.id} className={`nav-link ${view === v.id ? 'active fw-bold' : 'text-secondary'}`} onClick={() => update({ vista: v.id })}>
              {v.label}
            </button>
          </li>
        ))}
      </ul>

      {views.length < VIEWS.length && (
        <p className="small text-muted mb-3">Goleadores, asistencias, Fair Play, rendimiento y predicciones están disponibles con los <Link to="/planes">planes StatsHub</Link>.</p>
      )}

      {view === 'posiciones' && (
        <>
          <p className="text-muted small mb-3">
            {basket ? 'Se calcula con los partidos finalizados (reglamento FIBA): 2 puntos por victoria y 1 por derrota.' : 'Se calcula con los partidos finalizados: 3 puntos por victoria y 1 por empate.'}
            {liveCount > 0 && ` ${liveCount} partido${liveCount > 1 ? 's' : ''} en juego se sumará${liveCount > 1 ? 'n' : ''} al finalizar.`}
          </p>
          {standings.length === 0 ? <EmptyState title="Este torneo aún no tiene equipos">Inscribe equipos para ver la tabla.</EmptyState> : <StandingsTable rows={standings} basket={basket} />}
        </>
      )}

      {view === 'goleadores' && (scorers.length === 0
        ? <EmptyState title={basket ? 'Aún no hay puntos registrados' : 'Aún no hay goles registrados'}>Aparecerán aquí a medida que se registren las actas.</EmptyState>
        : <LeaderTable rows={scorers} valueKey={scorerKey} valueLabel={basket ? 'Puntos' : 'Goles'} teamName={teamName} />)}
      {view === 'rebotes' && (rebounders.length === 0
        ? <EmptyState title="Aún no hay rebotes registrados">Se registran desde el acta digital del partido.</EmptyState>
        : <LeaderTable rows={rebounders} valueKey="rebotes" valueLabel="Rebotes" teamName={teamName} />)}
      {view === 'asistencias' && (assisters.length === 0 ? <EmptyState title="Aún no hay asistencias registradas">{basket ? 'Se registran al anotar un doble o un triple en el acta digital.' : 'Se registran al anotar un gol en el acta digital.'}</EmptyState> : <LeaderTable rows={assisters} valueKey="asistencias" valueLabel="Asistencias" teamName={teamName} />)}
      {view === 'rendimiento' && (performance.length === 0 ? <EmptyState title="Sin equipos">Inscribe equipos para ver su rendimiento.</EmptyState> : <PerformanceTable rows={performance} basket={basket} />)}
      {view === 'fairplay' && (fairPlay.length === 0 ? <EmptyState title="Sin equipos">Inscribe equipos para ver el ranking de Fair Play.</EmptyState> : <FairPlayTable rows={fairPlay} basket={basket} />)}
      {view === 'prediccion' && (upcoming.length === 0 ? <EmptyState title="No hay partidos por predecir">Se necesitan partidos programados y resultados anteriores en el torneo.</EmptyState> : <PredictionTable items={upcoming} teamName={teamName} basket={basket} />)}
    </div>
  );
}
