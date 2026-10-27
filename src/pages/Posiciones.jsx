import { useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { MATCH_STATUS } from '../data/constants';
import { computeStandings } from '../utils/standings';

const COLUMNS = [
  { key: 'pj', label: 'PJ', title: 'Partidos jugados' },
  { key: 'pg', label: 'PG', title: 'Partidos ganados' },
  { key: 'pe', label: 'PE', title: 'Partidos empatados' },
  { key: 'pp', label: 'PP', title: 'Partidos perdidos' },
  { key: 'gf', label: 'GF', title: 'Goles a favor' },
  { key: 'gc', label: 'GC', title: 'Goles en contra' },
  { key: 'dg', label: 'DG', title: 'Diferencia de gol' },
];

export default function Posiciones() {
  const { tournaments, matches } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedId = Number(searchParams.get('torneo'));
  const selected =
    tournaments.find((t) => t.id === requestedId) ??
    tournaments.find((t) => t.status === 'En Curso') ??
    tournaments[0];

  const tournamentMatches = useMemo(
    () => (selected ? matches.filter((m) => m.tournamentId === selected.id) : []),
    [matches, selected],
  );
  const standings = useMemo(
    () => computeStandings(tournamentMatches.filter((m) => m.status === MATCH_STATUS.FINISHED)),
    [tournamentMatches],
  );
  const liveCount = tournamentMatches.filter((m) => m.status === MATCH_STATUS.LIVE).length;

  if (!selected) {
    return (
      <div className="card border-0 shadow-sm rounded-3 bg-white">
        <EmptyState title="Aún no hay torneos">Crea un torneo en Gestión de torneos para ver sus posiciones.</EmptyState>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>
          Tabla de posiciones
        </h2>
        <select
          className="form-select form-select-sm w-auto"
          aria-label="Torneo"
          value={selected.id}
          onChange={(e) => setSearchParams({ torneo: e.target.value })}
        >
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <p className="text-muted small mb-4">
        Se calcula con los partidos finalizados: 3 puntos por victoria y 1 por empate.
        {liveCount > 0 && ` ${liveCount} partido${liveCount > 1 ? 's' : ''} en juego se sumará${liveCount > 1 ? 'n' : ''} al finalizar.`}
      </p>

      {standings.length === 0 ? (
        <EmptyState title="Aún no hay partidos finalizados">
          Cuando se finalice un partido de este torneo, su resultado aparecerá aquí.
        </EmptyState>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle border">
            <thead className="table-dark" style={{ '--bs-table-bg': '#1E0A3C', '--bs-table-color': '#fff' }}>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Equipo</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} scope="col" className="text-center" title={c.title}>
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="text-center" title="Puntos">
                  PTS
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => (
                <tr key={row.team}>
                  <td className={`fw-bold ${index === 0 ? 'text-warning' : ''}`}>{index + 1}</td>
                  <td className="fw-bold text-dark">{row.team}</td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className="text-center">
                      {c.key === 'dg' && row.dg > 0 ? `+${row.dg}` : row[c.key]}
                    </td>
                  ))}
                  <td className="text-center fw-bold text-dark fs-6">{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
