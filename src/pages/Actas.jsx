import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlayCircle, Undo2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import EventModal from '../components/EventModal';
import StartMatchModal from '../components/StartMatchModal';
import { EVENT_TYPES, MATCH_STATUS, MAX_MINUTE } from '../data/constants';
import { useData } from '../hooks/useData';
import { byDateTime, formatDateShort } from '../utils/dates';
import { formatEvent } from '../utils/events';

const EVENT_BUTTONS = [
  { type: 'gol', label: '+ Registrar gol', cls: 'btn-success' },
  { type: 'amarilla', label: '+ Tarjeta amarilla', cls: 'btn-warning text-dark' },
  { type: 'roja', label: '+ Tarjeta roja', cls: 'btn-danger' },
  { type: 'sustitucion', label: '+ Sustitución', cls: 'btn-primary' },
  { type: 'lesion', label: '+ Lesión', cls: 'btn-secondary' },
];

// Jugadores en cancha según la convocatoria y los eventos (misma regla que valida el backend).
// "used" = quienes ya participaron: no pueden volver a entrar desde la banca.
function onFieldLineup(match, matchEvents) {
  const lineup = { home: [...(match.lineup?.home ?? [])], away: [...(match.lineup?.away ?? [])] };
  const used = new Set([...lineup.home, ...lineup.away]);
  [...matchEvents].sort((a, b) => a.minute - b.minute || a.id - b.id).forEach((e) => {
    const side = lineup[e.side];
    if (!side) return;
    if (e.type === 'sustitucion' || e.type === 'roja') {
      const index = side.indexOf(e.playerId);
      if (index >= 0) side.splice(index, 1);
    }
    if (e.type === 'sustitucion' && e.relatedId) {
      side.push(e.relatedId);
      used.add(e.relatedId);
    }
  });
  return { ...lineup, used: [...used] };
}

function TeamControls({ name, side, onEvent }) {
  return (
    <div className="p-3 border rounded-3 bg-white text-center h-100">
      <h3 className="h6 fw-bold text-dark mb-3">Controles: {name}</h3>
      <div className="d-flex flex-column gap-2">
        {EVENT_BUTTONS.map((b) => (
          <button key={b.type} type="button" onClick={() => onEvent(b.type, side)} className={`btn btn-sm fw-bold ${b.cls}`}>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Actas() {
  const { matches, events, players, teamName, playerName, addEvent, undoLastEvent, finishMatch, setMinute, startMatch } = useData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState(null); // { type, side }
  const [starting, setStarting] = useState(null);

  const liveMatches = matches.filter((m) => m.status === MATCH_STATUS.LIVE);
  const toStart = matches.filter((m) => m.status === MATCH_STATUS.SCHEDULED).sort(byDateTime).slice(0, 6);
  const requestedId = Number(searchParams.get('partido'));
  const match = liveMatches.find((m) => m.id === requestedId) ?? liveMatches[0];

  const handleStart = async (matchId, lineup) => {
    const result = await startMatch(matchId, lineup);
    if (!result.ok) return window.alert(result.error);
    setStarting(null);
    setSearchParams({ partido: String(matchId) });
  };

  const startPanel = (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <h2 className="h5 fw-bold mb-3" style={{ color: '#1E0A3C' }}>Iniciar un partido programado</h2>
      {toStart.length === 0 ? (
        <p className="text-muted small mb-0">No hay partidos programados. Prográmalos desde el calendario.</p>
      ) : (
        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
          {toStart.map((m) => (
            <li key={m.id} className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-2">
              <span>
                <span className="fw-semibold text-dark">{teamName(m.homeId)} vs {teamName(m.awayId)}</span>
                <span className="d-block small text-muted">{formatDateShort(m.date)}, {m.time}. {m.venue}</span>
              </span>
              <button type="button" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1" onClick={() => setStarting(m)}>
                <PlayCircle size={14} /> Iniciar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const startModal = starting && <StartMatchModal match={starting} players={players} teamName={teamName} onStart={handleStart} onHide={() => setStarting(null)} />;

  if (!match) {
    return (
      <div className="d-flex flex-column gap-4">
        <div className="card border-0 shadow-sm rounded-3 bg-white">
          <EmptyState title="No hay partidos en vivo">Inicia uno de los partidos programados para abrir su acta digital.</EmptyState>
        </div>
        {startPanel}
        {startModal}
      </div>
    );
  }

  const matchEvents = events.filter((e) => e.matchId === match.id).sort((a, b) => b.minute - a.minute || b.id - a.id);
  // Quién sigue en cancha (convocados, menos los que salieron o fueron expulsados, más los que entraron).
  const currentLineup = onFieldLineup(match, matchEvents);

  const notifyError = (result) => {
    if (!result.ok) window.alert(result.error);
  };

  const handleFinish = async () => {
    const summary = `${teamName(match.homeId)} ${match.scoreHome} - ${match.scoreAway} ${teamName(match.awayId)}`;
    if (!window.confirm(`¿Cerrar el acta?\n${summary}\nEsta acción es irreversible: el resultado pasará a la tabla de posiciones, se notificará a la liga y el árbitro recibirá el acta para validarla.`)) return;
    const result = await finishMatch(match.id);
    if (!result.ok) return window.alert(result.error);
    navigate('/actas', { replace: true });
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
              <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>Acta digital del partido</h2>
              {liveMatches.length > 1 && (
                <select className="form-select form-select-sm w-auto" aria-label="Partido en vivo" value={match.id} onChange={(e) => setSearchParams({ partido: e.target.value })}>
                  {liveMatches.map((m) => (
                    <option key={m.id} value={m.id}>{teamName(m.homeId)} vs {teamName(m.awayId)}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="p-3 p-md-4 bg-light rounded-3 border mb-3 text-center">
              <span className="badge bg-danger mb-2">EN VIVO · minuto {match.minute}&apos;</span>
              <div className="d-flex align-items-center justify-content-around gap-2 my-2">
                <div className="fw-bold fs-5 text-dark" style={{ width: '35%' }}>{teamName(match.homeId)}</div>
                <div className="fs-1 fw-bold text-warning bg-dark px-3 px-md-4 py-1 rounded-3 shadow-sm text-nowrap">{match.scoreHome} - {match.scoreAway}</div>
                <div className="fw-bold fs-5 text-dark" style={{ width: '35%' }}>{teamName(match.awayId)}</div>
              </div>
            </div>

            <div className="mb-3" style={{ maxWidth: '260px' }}>
              <label htmlFor="acta-minuto" className="form-label small fw-semibold text-muted mb-1">Minuto actual</label>
              <div className="input-group input-group-sm">
                <input
                  id="acta-minuto" type="number" min="0" max={MAX_MINUTE} className="form-control"
                  key={`${match.id}-${match.minute}`} defaultValue={match.minute}
                  onBlur={(e) => Number(e.target.value) !== match.minute && setMinute(match.id, e.target.value).then(notifyError)}
                />
                <button type="button" className="btn btn-outline-dark" onClick={() => setMinute(match.id, match.minute + 1).then(notifyError)}>+1 min</button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <TeamControls name={teamName(match.homeId)} side="home" onEvent={(type, side) => setDraft({ type, side })} />
              </div>
              <div className="col-12 col-sm-6">
                <TeamControls name={teamName(match.awayId)} side="away" onEvent={(type, side) => setDraft({ type, side })} />
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-between gap-2 mt-4 pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => undoLastEvent(match.id).then(notifyError)} disabled={matchEvents.length === 0}>
                <Undo2 size={16} /> Deshacer último evento
              </button>
              <button type="button" className="btn text-white fw-bold" style={{ backgroundColor: '#1E0A3C' }} onClick={handleFinish}>
                Finalizar partido
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white h-100">
            <h2 className="h5 fw-bold mb-3" style={{ color: '#1E0A3C' }}>Historial del partido</h2>
            {matchEvents.length === 0 ? (
              <p className="text-muted small mb-0">Aún no hay eventos. Registra el primer gol o tarjeta.</p>
            ) : (
              <ul className="list-unstyled d-flex flex-column gap-2 overflow-auto mb-0" style={{ maxHeight: '460px' }}>
                {matchEvents.map((e) => (
                  <li key={e.id} className="d-flex align-items-start gap-2 pb-2 border-bottom small text-dark fw-medium">
                    <span className={`badge ${EVENT_TYPES[e.type].badge} flex-shrink-0`}>{e.minute}&apos;</span>
                    <span>
                      {formatEvent(e, teamName(e.side === 'home' ? match.homeId : match.awayId), playerName)}
                      {e.automatic && <span className="text-muted fw-normal"> (doble amarilla)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {startPanel}
      {startModal}
      {draft && (
        <EventModal
          match={{ ...match, lineup: currentLineup }}
          side={draft.side}
          type={draft.type}
          players={players.filter((p) => !currentLineup.used.includes(p.id) || currentLineup[draft.side].includes(p.id))}
          teamName={teamName}
          onSave={async (data) => {
            const result = await addEvent(match.id, data);
            if (result.ok) setDraft(null);
            else window.alert(result.error);
          }}
          onHide={() => setDraft(null)}
        />
      )}
    </div>
  );
}
