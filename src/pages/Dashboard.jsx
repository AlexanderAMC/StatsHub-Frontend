import { Link, useOutletContext } from 'react-router-dom';
import { Activity, CheckCircle2, Lock, Radio, ShieldCheck, Trophy } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import KpiCard from '../components/KpiCard';
import { MATCH_STATUS } from '../data/constants';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';

const ARCHITECTURE = [
  'Frontend: React PWA Mobile-First',
  'Backend: Node.js + Express API REST',
  'BD: PostgreSQL (OLTP / OLAP)',
  'Cloud: AWS RDS, S3 & EC2',
];

export default function Dashboard() {
  const { tournaments, matches } = useOutletContext();
  const { can } = useAuth();
  const canRecord = can(PERMISSIONS.RECORD_MATCHES);

  const activeTournaments = tournaments.filter((t) => t.status === 'En Curso').length;
  const liveMatches = matches.filter((m) => m.status === MATCH_STATUS.LIVE);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Torneos en curso"
            value={activeTournaments}
            footer={`${tournaments.length} torneos registrados`}
            color="primary"
            icon={Trophy}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Partidos en vivo"
            value={liveMatches.length}
            footer="Con acta digital abierta"
            color="danger"
            icon={Radio}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Disponibilidad SLA"
            value="99.5%"
            footer="Objetivo en AWS"
            badge="Meta del proyecto"
            color="warning"
            icon={Activity}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <KpiCard
            title="Exactitud estadística"
            value="98.2%"
            footer="Objetivo KPI-03"
            badge="Meta del proyecto"
            color="success"
            icon={ShieldCheck}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 fw-bold m-0" style={{ color: '#1E0A3C' }}>
                Partidos en vivo
              </h2>
              {liveMatches.length > 0 && (
                <span className="badge bg-danger px-3 py-2 rounded-pill">● EN VIVO</span>
              )}
            </div>

            {liveMatches.length === 0 ? (
              <EmptyState title="No hay partidos en vivo">
                Cuando haya un partido en juego, aparecerá aquí con su marcador.
              </EmptyState>
            ) : (
              <div className="d-flex flex-column gap-3">
                {liveMatches.map((m) => (
                  <div key={m.id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <div className="fw-bold text-dark text-start" style={{ width: '40%' }}>
                        {m.home}
                      </div>
                      <div className="badge bg-warning text-dark fs-6 px-3 py-2 fw-bold shadow-sm">
                        {m.scoreHome} - {m.scoreAway}
                      </div>
                      <div className="fw-bold text-dark text-end" style={{ width: '40%' }}>
                        {m.away}
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <small className="text-muted">Minuto {m.minute}&apos;</small>
                      <Link
                        to={`/actas?partido=${m.id}`}
                        className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                      >
                        {!canRecord && <Lock size={14} />} Abrir acta
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 text-white h-100" style={{ backgroundColor: '#1E0A3C' }}>
            <h2 className="h5 fw-bold text-warning mb-3">Resumen de arquitectura</h2>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0">
              {ARCHITECTURE.map((item) => (
                <li key={item} className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={16} className="text-warning flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
