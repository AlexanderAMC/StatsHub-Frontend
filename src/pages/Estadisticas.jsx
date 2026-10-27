import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ExportButtons from '../components/ExportButtons';
import { MATCH_STATUS } from '../data/constants';
import { useData } from '../hooks/useData';
import { downloadCsv } from '../utils/csv';
import { byDateTime, formatDateShort } from '../utils/dates';
import { predictMatch } from '../utils/predict';
import { computePlayerStats, computeStandings, teamForm, teamTrend } from '../utils/stats';

const VIEWS = [
  { id: 'posiciones', label: 'Posiciones' },
  { id: 'goleadores', label: 'Goleadores' },
  { id: 'asistencias', label: 'Asistencias' },
  { id: 'rendimiento', label: 'Rendimiento' },
  { id: 'prediccion', label: 'Predicción' },
];

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

function StandingsTable({ rows }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle border">
        <thead className="table-dark" style={{ '--bs-table-bg': '#1E0A3C', '--bs-table-color': '#fff' }}>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Equipo</th>
            {STANDING_COLUMNS.map((c) => <th key={c.key} scope="col" className="text-center" title={c.title}>{c.label}</th>)}
            <th scope="col" className="text-center" title="Puntos">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.teamId}>
              <td className={`fw-bold ${i === 0 && row.pj > 0 ? 'text-warning' : ''}`}>{i + 1}</td>
              <td><Link to={`/equipos/${row.teamId}`} className="fw-bold text-dark text-decoration-none">{row.team}</Link></td>
              {STANDING_COLUMNS.map((c) => (
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

function PerformanceTable({ rows }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle border">
        <thead className="table-light">
          <tr>
            <th>Equipo</th>
            <th className="text-center" title="Partidos jugados">PJ</th>
            <th className="text-center" title="Goles a favor por partido">GF/PJ</th>
            <th className="text-center" title="Goles en contra por partido">GC/PJ</th>
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
                  <span className="fw-bold text-dark" style={{ width: '2.8rem' }}>{r.pj ? `${pct(r.pts / (3 * r.pj))}%` : '-'}</span>
                  <div className="progress flex-grow-1" style={{ height: '8px' }} role="img" aria-label="Efectividad">
                    <div className="progress-bar" style={{ width: `${r.pj ? pct(r.pts / (3 * r.pj)) : 0}%`, backgroundColor: '#1E0A3C' }} />
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

function PredictionTable({ items, teamName }) {
  return (
    <>
      <div className="table-responsive">
        <table className="table align-middle border">
          <thead className="table-light">
            <tr>
              <th>Partido</th>
              <th style={{ minWidth: '260px' }}>Probabilidad estimada</th>
              <th className="text-center" title="Goles esperados de cada equipo">Goles esperados</th>
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
                  <div className="progress" style={{ height: '10px' }} role="img" aria-label={`Local ${pct(prediction.home)}%, empate ${pct(prediction.draw)}%, visita ${pct(prediction.away)}%`}>
                    <div className="progress-bar" style={{ width: `${prediction.home * 100}%`, backgroundColor: '#1E0A3C' }} />
                    <div className="progress-bar bg-secondary" style={{ width: `${prediction.draw * 100}%` }} />
                    <div className="progress-bar bg-warning" style={{ width: `${prediction.away * 100}%` }} />
                  </div>
                  <span className="small text-muted">Local {pct(prediction.home)}%, empate {pct(prediction.draw)}%, visita {pct(prediction.away)}%</span>
                </td>
                <td className="text-center">{prediction.expectedHome.toFixed(1)} - {prediction.expectedAway.toFixed(1)}</td>
                <td className="text-center">{prediction.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small text-muted mb-0">
        Modelo estadístico base (distribución de Poisson) calculado con el ataque y la defensa de cada equipo en el torneo. Es una estimación
        para apoyar el análisis, no una garantía. Con más partidos jugados, la confianza aumenta.
      </p>
    </>
  );
}

export default function Estadisticas() {
  const { tournaments, teams, players, matches, events, teamName } = useData();
  const [params, setParams] = useSearchParams();

  const view = VIEWS.find((v) => v.id === params.get('vista'))?.id ?? 'posiciones';
  const requestedId = Number(params.get('torneo'));
  const selected = tournaments.find((t) => t.id === requestedId) ?? tournaments.find((t) => t.status === 'En Curso') ?? tournaments[0];
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
  const standings = useMemo(() => computeStandings(tTeams, finished), [tTeams, finished]);
  const playerStats = useMemo(() => computePlayerStats(players, tMatches, events), [players, tMatches, events]);

  const leaders = (key) =>
    players
      .map((player) => ({ player, ...playerStats.get(player.id) }))
      .filter((r) => r[key] > 0)
      .sort((a, b) => b[key] - a[key] || a.pj - b.pj || a.player.name.localeCompare(b.player.name));
  const scorers = useMemo(() => leaders('goles'), [players, playerStats]); // eslint-disable-line react-hooks/exhaustive-deps
  const assisters = useMemo(() => leaders('asistencias'), [players, playerStats]); // eslint-disable-line react-hooks/exhaustive-deps

  const performance = useMemo(
    () => standings.map((row) => ({ ...row, form: teamForm(row.teamId, finished), trend: teamTrend(row.teamId, finished) })),
    [standings, finished],
  );
  const upcoming = useMemo(
    () =>
      tMatches
        .filter((m) => m.status === MATCH_STATUS.SCHEDULED)
        .sort(byDateTime)
        .map((match) => ({ match, prediction: predictMatch(match.homeId, match.awayId, finished) }))
        .filter((item) => item.prediction),
    [tMatches, finished],
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
    } else if (view === 'goleadores' || view === 'asistencias') {
      const key = view === 'goleadores' ? 'goles' : 'asistencias';
      downloadCsv(file, ['Pos', 'Jugador', 'Equipo', 'PJ', view === 'goleadores' ? 'Goles' : 'Asistencias'], leaders(key).map((r, i) => [i + 1, r.player.name, teamName(r.player.teamId), r.pj, r[key]]));
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
          <p className="text-muted small mb-0">{selected.name}. Temporada {selected.season}.</p>
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
        {VIEWS.map((v) => (
          <li className="nav-item" key={v.id} role="presentation">
            <button type="button" role="tab" aria-selected={view === v.id} className={`nav-link ${view === v.id ? 'active fw-bold' : 'text-secondary'}`} onClick={() => update({ vista: v.id })}>
              {v.label}
            </button>
          </li>
        ))}
      </ul>

      {view === 'posiciones' && (
        <>
          <p className="text-muted small mb-3">
            Se calcula con los partidos finalizados: 3 puntos por victoria y 1 por empate.
            {liveCount > 0 && ` ${liveCount} partido${liveCount > 1 ? 's' : ''} en juego se sumará${liveCount > 1 ? 'n' : ''} al finalizar.`}
          </p>
          {standings.length === 0 ? <EmptyState title="Este torneo aún no tiene equipos">Inscribe equipos para ver la tabla.</EmptyState> : <StandingsTable rows={standings} />}
        </>
      )}

      {view === 'goleadores' && (scorers.length === 0 ? <EmptyState title="Aún no hay goles registrados">Los goles aparecerán aquí a medida que se registren las actas.</EmptyState> : <LeaderTable rows={scorers} valueKey="goles" valueLabel="Goles" teamName={teamName} />)}
      {view === 'asistencias' && (assisters.length === 0 ? <EmptyState title="Aún no hay asistencias registradas">Se registran al anotar un gol en el acta digital.</EmptyState> : <LeaderTable rows={assisters} valueKey="asistencias" valueLabel="Asistencias" teamName={teamName} />)}
      {view === 'rendimiento' && (performance.length === 0 ? <EmptyState title="Sin equipos">Inscribe equipos para ver su rendimiento.</EmptyState> : <PerformanceTable rows={performance} />)}
      {view === 'prediccion' && (upcoming.length === 0 ? <EmptyState title="No hay partidos por predecir">Se necesitan partidos programados y resultados anteriores en el torneo.</EmptyState> : <PredictionTable items={upcoming} teamName={teamName} />)}
    </div>
  );
}
