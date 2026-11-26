import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlayCircle, Undo2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import EventModal from '../components/EventModal';
import ActaValidationPanel from '../components/ActaValidationPanel';
import StartMatchModal from '../components/StartMatchModal';
import { BASKETBALL, EVENT_TYPES, MATCH_STATUS, MAX_MINUTE, isBasketball, periodLabel } from '../data/constants';
import { useData } from '../hooks/useData';
import { byDateTime, formatDateShort } from '../utils/dates';
import { basketballFouls, formatEvent, teamFoulsInPeriod } from '../utils/events';

const FOOTBALL_BUTTONS = [
  { type: 'gol', label: '+ Registrar gol', cls: 'btn-success' },
  { type: 'amarilla', label: '+ Tarjeta amarilla', cls: 'btn-warning text-dark' },
  { type: 'roja', label: '+ Tarjeta roja', cls: 'btn-danger' },
  { type: 'sustitucion', label: '+ Sustitución', cls: 'btn-primary' },
  { type: 'lesion', label: '+ Lesión', cls: 'btn-secondary' },
];

const BASKETBALL_BUTTONS = [
  { type: 'punto1', label: '+1 Tiro libre', cls: 'btn-success' },
  { type: 'punto2', label: '+2 Doble', cls: 'btn-success' },
  { type: 'punto3', label: '+3 Triple', cls: 'btn-success' },
  { type: 'rebote', label: '+ Rebote', cls: 'btn-info text-dark' },
  { type: 'falta', label: '+ Falta personal', cls: 'btn-warning text-dark' },
  { type: 'tecnica', label: '+ Falta técnica', cls: 'btn-outline-danger' },
  { type: 'antideportiva', label: '+ Antideportiva', cls: 'btn-danger' },
  { type: 'sustitucion', label: '+ Cambio', cls: 'btn-primary' },
  { type: 'tiempo', label: 'Tiempo muerto', cls: 'btn-dark' },
  { type: 'lesion', label: '+ Lesión', cls: 'btn-secondary' },
];

// Jugadores en cancha según la convocatoria y los eventos (misma regla que valida el backend).
// "used" = quienes ya participaron: no pueden volver a entrar desde la banca.
// En básquetbol los cambios admiten reingreso y salen de cancha los eliminados por faltas.
function onFieldLineup(match, matchEvents, out = new Set()) {
  const lineup = { home: [...(match.lineup?.home ?? [])], away: [...(match.lineup?.away ?? [])] };
  const used = new Set([...lineup.home, ...lineup.away]);
  [...matchEvents].sort((a, b) => a.id - b.id).forEach((e) => {
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
  return { home: lineup.home.filter((id) => !out.has(id)), away: lineup.away.filter((id) => !out.has(id)), used: [...used] };
}

function TeamControls({ name, side, buttons, onEvent, foulsLabel }) {
  return (
    <div className="p-3 border rounded-3 bg-white text-center h-100">
      <h3 className="h6 fw-bold text-dark mb-1">Controles: {name}</h3>
      <p className="small text-muted mb-2">{foulsLabel ?? ' '}</p>
      <div className="d-flex flex-column gap-2">
        {buttons.map((b) => (
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
        <ActaValidationPanel />
        {startModal}
      </div>
    );
  }

  const basket = isBasketball(match.sport);
  const matchEvents = events.filter((e) => e.matchId === match.id).sort((a, b) => b.id - a.id);
  const { fouls, out } = basket ? basketballFouls(matchEvents) : { fouls: new Map(), out: new Set() };
  // Quién sigue en cancha (convocados, menos los que salieron, expulsados o eliminados, más los que entraron).
  const currentLineup = onFieldLineup(match, matchEvents, out);
  const maxMinute = basket ? (match.period > BASKETBALL.periods ? BASKETBALL.overtimeMinutes : BASKETBALL.periodMinutes) : MAX_MINUTE;
  const foulsLabel = (side) => {
    if (!basket) return null;
    const n = teamFoulsInPeriod(matchEvents, side, match.period);
    return `Faltas de equipo en el cuarto: ${n}${n >= BASKETBALL.teamFoulBonus ? ' (bonus: tiros libres)' : ''}`;
  };
  // En básquetbol cualquiera que no esté eliminado puede entrar (hay reingreso); en fútbol, no.
  const eventPlayers = basket
    ? players.filter((p) => !out.has(p.id))
    : players.filter((p) => !currentLineup.used.includes(p.id) || currentLineup[draft?.side ?? 'home'].includes(p.id));

  const notifyError = (result) => {
    if (!result.ok) window.alert(result.error);
  };

  const handleEvent = (type, side) => {
    // El tiempo muerto es del equipo: se registra sin elegir jugador.
    if (type === 'tiempo') return addEvent(match.id, { type, side, playerId: null }).then(notifyError);
    return setDraft({ type, side });
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
              <span className="badge bg-danger mb-2">EN VIVO · {basket ? `${periodLabel(match.period)} · minuto ${match.minute}` : `minuto ${match.minute}'`}</span>
              <div className="d-flex align-items-center justify-content-around gap-2 my-2">
                <div className="fw-bold fs-5 text-dark" style={{ width: '35%' }}>{teamName(match.homeId)}</div>
                <div className="fs-1 fw-bold text-warning bg-dark px-3 px-md-4 py-1 rounded-3 shadow-sm text-nowrap">{match.scoreHome} - {match.scoreAway}</div>
                <div className="fw-bold fs-5 text-dark" style={{ width: '35%' }}>{teamName(match.awayId)}</div>
              </div>
            </div>

            <div className="mb-3" style={{ maxWidth: '260px' }}>
              {basket && (
                <select className="form-select form-select-sm mb-2" aria-label="Cuarto" value={match.period} onChange={(e) => setMinute(match.id, 0, Number(e.target.value)).then(notifyError)}>
                  {Array.from({ length: Math.max(match.period + 1, BASKETBALL.periods + 1) }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>{periodLabel(p)}</option>
                  ))}
                </select>
              )}
              <label htmlFor="acta-minuto" className="form-label small fw-semibold text-muted mb-1">{basket ? 'Minuto del cuarto' : 'Minuto actual'}</label>
              <div className="input-group input-group-sm">
                <input
                  id="acta-minuto" type="number" min="0" max={maxMinute} className="form-control"
                  key={`${match.id}-${match.minute}`} defaultValue={match.minute}
                  onBlur={(e) => Number(e.target.value) !== match.minute && setMinute(match.id, e.target.value, basket ? match.period : undefined).then(notifyError)}
                />
                <button type="button" className="btn btn-outline-dark" onClick={() => setMinute(match.id, Math.min(match.minute + 1, maxMinute), basket ? match.period : undefined).then(notifyError)}>+1 min</button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <TeamControls name={teamName(match.homeId)} side="home" buttons={basket ? BASKETBALL_BUTTONS : FOOTBALL_BUTTONS} foulsLabel={foulsLabel('home')} onEvent={handleEvent} />
              </div>
              <div className="col-12 col-sm-6">
                <TeamControls name={teamName(match.awayId)} side="away" buttons={basket ? BASKETBALL_BUTTONS : FOOTBALL_BUTTONS} foulsLabel={foulsLabel('away')} onEvent={handleEvent} />
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
              <p className="text-muted small mb-0">{basket ? 'Aún no hay eventos. Registra la primera canasta o falta.' : 'Aún no hay eventos. Registra el primer gol o tarjeta.'}</p>
            ) : (
              <ul className="list-unstyled d-flex flex-column gap-2 overflow-auto mb-0" style={{ maxHeight: '460px' }}>
                {matchEvents.map((e) => (
                  <li key={e.id} className="d-flex align-items-start gap-2 pb-2 border-bottom small text-dark fw-medium">
                    <span className={`badge ${EVENT_TYPES[e.type]?.badge ?? 'bg-secondary'} flex-shrink-0`}>{basket && e.period ? `C${e.period} ${e.minute}'` : `${e.minute}'`}</span>
                    <span>
                      {formatEvent(e, teamName(e.side === 'home' ? match.homeId : match.awayId), playerName)}
                      {e.automatic && <span className="text-muted fw-normal"> (doble amarilla)</span>}
                      {basket && EVENT_TYPES[e.type]?.foul && <span className="text-muted fw-normal"> · {fouls.get(e.playerId) ?? 0} en total{out.has(e.playerId) ? ', eliminado' : ''}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {startPanel}
      <ActaValidationPanel />
      {startModal}
      {draft && (
        <EventModal
          match={{ ...match, lineup: currentLineup }}
          side={draft.side}
          type={draft.type}
          players={eventPlayers}
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
