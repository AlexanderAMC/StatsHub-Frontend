import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { EVENT_TYPES } from '../data/constants';
import { useData } from '../hooks/useData';
import { formatDateShort } from '../utils/dates';
import { describePlayerEvent, playerInvolved } from '../utils/events';
import { computePlayerStats } from '../utils/stats';

export default function JugadorDetalle() {
  const { playerId } = useParams();
  const { players, matches, events, transfers, teamName } = useData();

  const id = Number(playerId);
  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <div className="card border-0 shadow-sm rounded-3 bg-white">
        <EmptyState title="No encontramos a ese jugador">
          Puede haber sido eliminado. <Link to="/equipos">Volver a equipos</Link>
        </EmptyState>
      </div>
    );
  }

  const stats = computePlayerStats(players, matches, events).get(id);
  const history = events
    .filter((e) => playerInvolved(e, id))
    .map((e) => ({ event: e, match: matches.find((m) => m.id === e.matchId) }))
    .filter((row) => row.match)
    .sort((a, b) => `${b.match.date}${b.event.minute}`.localeCompare(`${a.match.date}${a.event.minute}`));
  const playerTransfers = transfers.filter((t) => t.playerId === id);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <Link to={player.teamId ? `/equipos/${player.teamId}` : '/equipos'} className="small text-decoration-none d-inline-flex align-items-center gap-1 mb-3">
          <ArrowLeft size={14} /> {player.teamId ? teamName(player.teamId) : 'Equipos'}
        </Link>
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold fs-3 flex-shrink-0" style={{ width: '64px', height: '64px' }}>
            {player.number}
          </span>
          <div>
            <h2 className="h3 fw-bold mb-0" style={{ color: '#1E0A3C' }}>{player.name}</h2>
            <p className="text-muted mb-0">{player.position}. {player.teamId ? teamName(player.teamId) : 'Sin equipo'}</p>
          </div>
        </div>
        <div className="row g-3">
          {[
            ['Partidos', stats.pj],
            ['Goles', stats.goles],
            ['Asistencias', stats.asistencias],
            ['Amarillas', stats.amarillas],
            ['Rojas', stats.rojas],
          ].map(([label, value]) => (
            <div key={label} className="col-6 col-md">
              <div className="p-3 bg-light rounded-3 border h-100">
                <span className="small text-muted d-block">{label}</span>
                <span className="h4 fw-bold text-dark mb-0">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white h-100">
            <h3 className="h5 fw-bold mb-3" style={{ color: '#1E0A3C' }}>Historial deportivo</h3>
            {history.length === 0 ? (
              <p className="text-muted small mb-0">Todavía no tiene eventos registrados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr><th>Fecha</th><th>Partido</th><th>Evento</th><th className="text-end">Min.</th></tr>
                  </thead>
                  <tbody>
                    {history.map(({ event, match }) => (
                      <tr key={event.id}>
                        <td className="text-nowrap small">{formatDateShort(match.date)}</td>
                        <td className="small">{teamName(match.homeId)} vs {teamName(match.awayId)}</td>
                        <td><span className={`badge ${EVENT_TYPES[event.type].badge}`}>{describePlayerEvent(event, id)}</span></td>
                        <td className="text-end small">{event.minute}&apos;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white h-100">
            <h3 className="h5 fw-bold mb-3" style={{ color: '#1E0A3C' }}>Historial de equipos</h3>
            {playerTransfers.length === 0 ? (
              <p className="text-muted small mb-0">Sin transferencias registradas.</p>
            ) : (
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                {playerTransfers.map((t) => (
                  <li key={t.id} className="border-bottom pb-2 small">
                    <span className="text-muted d-block">{formatDateShort(t.date)}</span>
                    {teamName(t.fromTeamId)} → <strong>{teamName(t.toTeamId)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
