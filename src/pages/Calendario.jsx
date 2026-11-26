import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CalendarPlus, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import FixtureModal from '../components/FixtureModal';
import MatchFormModal from '../components/MatchFormModal';
import RestrictedActionModal from '../components/RestrictedActionModal';
import StartMatchModal from '../components/StartMatchModal';
import { MATCH_BADGE, MATCH_STATUS } from '../data/constants';
import { PERMISSIONS } from '../data/users';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { byDateTime, formatDate } from '../utils/dates';
import { predictMatch } from '../utils/predict';

const { SCHEDULED, LIVE, FINISHED } = MATCH_STATUS;
const VIEWS = [
  { id: 'proximos', label: 'Próximos' },
  { id: 'finalizados', label: 'Finalizados' },
  { id: 'todos', label: 'Todos' },
];

const pct = (p) => `${Math.round(p * 100)}%`;

export default function Calendario() {
  const {
    tournaments, teams, players, matches, referees, statsKeepers, venues, predictions, teamName,
    scheduleMatch, updateScheduledMatch, cancelMatch, sendReminder, generateFixture, startMatch,
  } = useData();
  const { can } = useAuth();
  const navigate = useNavigate();
  const canSchedule = can(PERMISSIONS.SCHEDULE_MATCHES);
  const canRecord = can(PERMISSIONS.RECORD_MATCHES);

  const [view, setView] = useState('proximos');
  const [tournamentFilter, setTournamentFilter] = useState('todos');
  const [teamFilter, setTeamFilter] = useState('todos');
  const [matchModal, setMatchModal] = useState(null); // { match } · match null = programar
  const [showFixture, setShowFixture] = useState(false);
  const [starting, setStarting] = useState(null);
  const [restricted, setRestricted] = useState('');

  const guard = (allowed, action, text) => () => (allowed ? action() : setRestricted(text));
  const refereeName = (id) => referees.find((r) => r.id === id)?.name ?? 'Sin asignar';

  const visible = matches
    .filter((m) => {
      if (tournamentFilter !== 'todos' && String(m.tournamentId) !== tournamentFilter) return false;
      if (teamFilter !== 'todos' && String(m.homeId) !== teamFilter && String(m.awayId) !== teamFilter) return false;
      if (view === 'proximos') return m.status !== FINISHED;
      if (view === 'finalizados') return m.status === FINISHED;
      return true;
    })
    .sort((a, b) => (view === 'finalizados' ? byDateTime(b, a) : byDateTime(a, b)));

  const groups = [];
  visible.forEach((m) => {
    const last = groups[groups.length - 1];
    if (last && last.date === m.date) last.items.push(m);
    else groups.push({ date: m.date, items: [m] });
  });

  // RF-37: predicción del servidor (modelo de Machine Learning). Si no está disponible, cálculo local.
  const predictionFor = (m) => {
    if (predictions[m.id]) return predictions[m.id];
    const finished = matches.filter((x) => x.tournamentId === m.tournamentId && x.status === FINISHED);
    return predictMatch(m.homeId, m.awayId, finished, m.sport);
  };

  const handleSaveMatch = async (data) => {
    const result = matchModal.match ? await updateScheduledMatch(matchModal.match.id, data) : await scheduleMatch(data);
    if (result.ok) setMatchModal(null);
    else window.alert(result.error);
  };

  const handleCancel = async (m) => {
    if (!window.confirm(`¿Suspender el partido ${teamName(m.homeId)} vs ${teamName(m.awayId)}? Se avisará por notificación.`)) return;
    const result = await cancelMatch(m.id);
    if (!result.ok) window.alert(result.error);
  };

  const handleReminder = async (m) => {
    const result = await sendReminder(m.id);
    window.alert(result.ok ? 'Recordatorio enviado a la liga.' : result.error);
  };

  const handleStart = async (matchId, lineup) => {
    const result = await startMatch(matchId, lineup);
    if (!result.ok) return window.alert(result.error);
    setStarting(null);
    navigate(`/actas?partido=${matchId}`);
  };

  const teamOptions = teams.filter((t) => tournamentFilter === 'todos' || String(t.tournamentId) === tournamentFilter);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>Calendario de partidos</h2>
            <p className="text-muted small mb-0">Horarios, canchas, árbitros y resultados de cada jornada.</p>
          </div>
          <div className="d-flex flex-wrap gap-2 no-print">
            {canSchedule && (<button type="button" className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={guard(canSchedule, () => setShowFixture(true), 'generar el fixture de un torneo')}>
              <CalendarPlus size={18} /> Generar fixture
            </button>)}
            {canSchedule && (<button type="button" className="btn text-white fw-bold d-flex align-items-center gap-2" style={{ backgroundColor: '#1E0A3C' }} onClick={guard(canSchedule, () => setMatchModal({ match: null }), 'programar partidos')}>
              <Plus size={18} /> Programar partido
            </button>)}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center no-print">
          <div className="btn-group btn-group-sm" role="group" aria-label="Vista del calendario">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" className={`btn ${view === v.id ? 'btn-dark' : 'btn-outline-dark'}`} aria-pressed={view === v.id} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
          <select className="form-select form-select-sm w-auto" aria-label="Filtrar por torneo" value={tournamentFilter} onChange={(e) => { setTournamentFilter(e.target.value); setTeamFilter('todos'); }}>
            <option value="todos">Todos los torneos</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select className="form-select form-select-sm w-auto" aria-label="Filtrar por equipo" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="todos">Todos los equipos</option>
            {teamOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 bg-white">
          <EmptyState title="No hay partidos para mostrar">Cambia los filtros o programa un partido nuevo.</EmptyState>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.date} aria-label={formatDate(group.date)}>
            <h3 className="h6 fw-bold text-uppercase text-muted mb-2" style={{ letterSpacing: '0.08em' }}>{formatDate(group.date)}</h3>
            <div className="d-flex flex-column gap-2">
              {group.items.map((m) => {
                // Predicción con ML: plan Pro o superior.
                const prediction = m.status === SCHEDULED && can(PERMISSIONS.ANALYTICS) ? predictionFor(m) : null;
                return (
                  <div key={m.id} className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-2">
                        <span className="h5 fw-bold text-dark mb-0 d-block">{m.time}</span>
                        <span className={`badge ${MATCH_BADGE[m.status]}`}>{m.status === LIVE ? `● En vivo ${m.minute}'` : m.status}</span>
                      </div>
                      <div className="col-12 col-md-5">
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <span className="fw-bold text-dark text-start flex-grow-1" style={{ width: '38%' }}>{teamName(m.homeId)}</span>
                          <span className="badge bg-light text-dark border fs-6 px-3 py-2 text-nowrap">{m.status === SCHEDULED ? 'vs' : `${m.scoreHome} - ${m.scoreAway}`}</span>
                          <span className="fw-bold text-dark text-end flex-grow-1" style={{ width: '38%' }}>{teamName(m.awayId)}</span>
                        </div>
                      </div>
                      <div className="col-12 col-md-5 d-flex flex-column gap-2 align-items-md-end">
                        <span className="small text-muted">Jornada {m.round}. {m.venue}. Árbitro: {refereeName(m.refereeId)}</span>
                        <div className="d-flex flex-wrap gap-1 no-print">
                          {m.status === SCHEDULED && (
                            <>
                              {canRecord && (<button type="button" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1" onClick={guard(canRecord, () => setStarting(m), 'iniciar partidos y registrar actas')}>
                                <PlayCircle size={14} /> Iniciar
                              </button>)}
                              {canSchedule && (<button type="button" className="btn btn-sm btn-outline-dark" onClick={guard(canSchedule, () => setMatchModal({ match: m }), 'editar partidos')} aria-label="Editar partido">
                                <Pencil size={14} />
                              </button>)}
                              {canSchedule && (<button type="button" className="btn btn-sm btn-outline-dark" onClick={guard(canSchedule, () => handleReminder(m), 'enviar recordatorios')} aria-label="Enviar recordatorio">
                                <Bell size={14} />
                              </button>)}
                              {canSchedule && (<button type="button" className="btn btn-sm btn-outline-danger" onClick={guard(canSchedule, () => handleCancel(m), 'suspender partidos')} aria-label="Suspender partido">
                                <Trash2 size={14} />
                              </button>)}
                            </>
                          )}
                          {m.status === LIVE && canRecord && (
                            <Link to={`/actas?partido=${m.id}`} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
                               Abrir acta
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    {prediction && (
                      <p className="small text-muted mb-0 mt-2 pt-2 border-top">
                        {/* Básquetbol no tiene empate: se juega prórroga. */}
                        Probabilidad estimada: {teamName(m.homeId)} {pct(prediction.home)}{m.sport === 'BASQUETBOL' ? '' : `, empate ${pct(prediction.draw)}`}, {teamName(m.awayId)} {pct(prediction.away)}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {restricted && <RestrictedActionModal show onHide={() => setRestricted('')} action={restricted} />}
      {matchModal && (
        <MatchFormModal statsKeepers={statsKeepers}
          key={matchModal.match?.id ?? 'nuevo'}
          match={matchModal.match}
          tournaments={tournaments}
          teams={teams}
          matches={matches}
          referees={referees}
          venues={venues}
          defaultTournamentId={tournamentFilter === 'todos' ? undefined : Number(tournamentFilter)}
          onSave={handleSaveMatch}
          onHide={() => setMatchModal(null)}
        />
      )}
      {showFixture && (
        <FixtureModal tournaments={tournaments} teams={teams} matches={matches} referees={referees} venues={venues} onGenerate={generateFixture} onHide={() => setShowFixture(false)} />
      )}
      {starting && <StartMatchModal match={starting} players={players} teamName={teamName} onStart={handleStart} onHide={() => setStarting(null)} />}
    </div>
  );
}
