import { Link } from 'react-router-dom';
import { CalendarDays, Lock, Radio, Target, Trophy, Users } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import KpiCard from '../components/KpiCard';
import { MATCH_STATUS } from '../data/constants';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { byDateTime, formatDateShort } from '../utils/dates';

// Metas del informe de formulación del proyecto (indicadores de éxito y requerimientos no funcionales).
const GOALS = [
  'Resultados publicados en tiempo real al finalizar el partido',
  '0% de actas perdidas por extravío',
  'Más del 80% de los equipos usando la plataforma en el primer torneo',
  'Disponibilidad del 99% en días de partido',
  'Carga de pantallas en menos de 2,5 segundos en 4G',
];

export default function Dashboard() {
  const { tournaments, teams, players, matches, teamName } = useData();
  const { can } = useAuth();
  const canRecord = can(PERMISSIONS.RECORD_MATCHES);

  const activeTournaments = tournaments.filter((t) => t.status === 'En Curso').length;
  const liveMatches = matches.filter((m) => m.status === MATCH_STATUS.LIVE);
  const upcoming = matches.filter((m) => m.status === MATCH_STATUS.SCHEDULED).sort(byDateTime);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard title="Torneos en curso" value={activeTournaments} footer={`${tournaments.length} torneos registrados`} color="primary" icon={Trophy} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard title="Equipos registrados" value={teams.length} footer={`${players.length} jugadores inscritos`} color="warning" icon={Users} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard title="Partidos en vivo" value={liveMatches.length} footer="Con acta digital abierta" color="danger" icon={Radio} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard title="Próximos partidos" value={upcoming.length} footer="Programados en el calendario" color="success" icon={CalendarDays} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 fw-bold m-0" style={{ color: '#1E0A3C' }}>Partidos en vivo</h2>
              {liveMatches.length > 0 && <span className="badge bg-danger px-3 py-2 rounded-pill">● EN VIVO</span>}
            </div>

            {liveMatches.length === 0 ? (
              <EmptyState title="No hay partidos en vivo">Cuando haya un partido en juego, aparecerá aquí con su marcador.</EmptyState>
            ) : (
              <div className="d-flex flex-column gap-3">
                {liveMatches.map((m) => (
                  <div key={m.id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <div className="fw-bold text-dark text-start" style={{ width: '40%' }}>{teamName(m.homeId)}</div>
                      <div className="badge bg-warning text-dark fs-6 px-3 py-2 fw-bold shadow-sm">{m.scoreHome} - {m.scoreAway}</div>
                      <div className="fw-bold text-dark text-end" style={{ width: '40%' }}>{teamName(m.awayId)}</div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <small className="text-muted">Minuto {m.minute}&apos;</small>
                      <Link to={`/actas?partido=${m.id}`} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
                        {!canRecord && <Lock size={14} />} Abrir acta
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 fw-bold m-0" style={{ color: '#1E0A3C' }}>Próximos partidos</h2>
              <Link to="/calendario" className="btn btn-sm btn-outline-dark">Ver calendario</Link>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState title="No hay partidos programados">Programa partidos desde el calendario.</EmptyState>
            ) : (
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                {upcoming.slice(0, 4).map((m) => (
                  <li key={m.id} className="d-flex align-items-center justify-content-between gap-3 p-2 border-bottom">
                    <span className="fw-semibold text-dark">{teamName(m.homeId)} vs {teamName(m.awayId)}</span>
                    <span className="text-muted small text-nowrap">{formatDateShort(m.date)}, {m.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 text-white h-100" style={{ backgroundColor: '#1E0A3C' }}>
            <h2 className="h5 fw-bold text-warning mb-1">Metas del proyecto</h2>
            <p className="small text-white-50 mb-3">Objetivos definidos en el informe de formulación.</p>
            <ul className="list-unstyled d-flex flex-column gap-3 small mb-0">
              {GOALS.map((goal) => (
                <li key={goal} className="d-flex align-items-start gap-2">
                  <Target size={16} className="text-warning flex-shrink-0 mt-1" /> {goal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
