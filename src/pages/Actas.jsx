import { useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { Undo2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { MATCH_STATUS, MAX_MINUTE } from '../data/constants';
import { formatEvent } from '../utils/events';

const EVENT_BADGE = {
  gol: 'bg-success',
  amarilla: 'bg-warning text-dark',
  roja: 'bg-danger',
};

function TeamControls({ name, side, onEvent }) {
  return (
    <div className="p-3 border rounded-3 bg-white text-center h-100">
      <h3 className="h6 fw-bold text-dark mb-3">Controles: {name}</h3>
      <div className="d-flex flex-column gap-2">
        <button type="button" onClick={() => onEvent('gol', side)} className="btn btn-success fw-bold">
          + Registrar gol
        </button>
        <button type="button" onClick={() => onEvent('amarilla', side)} className="btn btn-warning fw-bold text-dark">
          + Tarjeta amarilla
        </button>
        <button type="button" onClick={() => onEvent('roja', side)} className="btn btn-danger fw-bold">
          + Tarjeta roja
        </button>
      </div>
    </div>
  );
}

export default function Actas() {
  const { matches, events, addEvent, undoLastEvent, finishMatch, setMinute } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [player, setPlayer] = useState('');

  const liveMatches = matches.filter((m) => m.status === MATCH_STATUS.LIVE);
  const requestedId = Number(searchParams.get('partido'));
  const match = liveMatches.find((m) => m.id === requestedId) ?? liveMatches[0];

  if (!match) {
    return (
      <div className="card border-0 shadow-sm rounded-3 bg-white">
        <EmptyState title="No hay partidos en vivo">
          Los partidos finalizados cuentan en la tabla de <Link to="/posiciones">posiciones</Link>.
        </EmptyState>
      </div>
    );
  }

  const matchEvents = events.filter((e) => e.matchId === match.id);

  const handleEvent = (type, side) => {
    addEvent(match.id, type, side, player);
    setPlayer('');
  };

  const handleFinish = () => {
    const result = `${match.home} ${match.scoreHome} - ${match.scoreAway} ${match.away}`;
    if (window.confirm(`¿Finalizar el partido?\n${result}\nEl resultado pasará a la tabla de posiciones.`)) {
      finishMatch(match.id);
      setPlayer('');
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
            <h2 className="h4 fw-bold m-0" style={{ color: '#1E0A3C' }}>
              Acta digital del partido
            </h2>
            {liveMatches.length > 1 && (
              <select
                className="form-select form-select-sm w-auto"
                aria-label="Partido en vivo"
                value={match.id}
                onChange={(e) => setSearchParams({ partido: e.target.value })}
              >
                {liveMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.home} vs {m.away}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="p-3 p-md-4 bg-light rounded-3 border mb-3 text-center">
            <span className="badge bg-danger mb-2">EN VIVO · minuto {match.minute}&apos;</span>
            <div className="d-flex align-items-center justify-content-around gap-2 my-2">
              <div className="fw-bold fs-5 text-dark" style={{ width: '35%' }}>
                {match.home}
              </div>
              <div className="fs-1 fw-bold text-warning bg-dark px-3 px-md-4 py-1 rounded-3 shadow-sm text-nowrap">
                {match.scoreHome} - {match.scoreAway}
              </div>
              <div className="fw-bold fs-5 text-dark" style={{ width: '35%' }}>
                {match.away}
              </div>
            </div>
          </div>

          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-sm-5">
              <label htmlFor="acta-minuto" className="form-label small fw-semibold text-muted mb-1">
                Minuto actual
              </label>
              <div className="input-group input-group-sm">
                <input
                  id="acta-minuto"
                  type="number"
                  min="0"
                  max={MAX_MINUTE}
                  className="form-control"
                  value={match.minute}
                  onChange={(e) => setMinute(match.id, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => setMinute(match.id, match.minute + 1)}
                >
                  +1 min
                </button>
              </div>
            </div>
            <div className="col-12 col-sm-7">
              <label htmlFor="acta-jugador" className="form-label small fw-semibold text-muted mb-1">
                Jugador (opcional)
              </label>
              <input
                id="acta-jugador"
                type="text"
                className="form-control form-control-sm"
                placeholder="Ej: G. Tapia"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <TeamControls name={match.home} side="home" onEvent={handleEvent} />
            </div>
            <div className="col-12 col-sm-6">
              <TeamControls name={match.away} side="away" onEvent={handleEvent} />
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-between gap-2 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={() => undoLastEvent(match.id)}
              disabled={matchEvents.length === 0}
            >
              <Undo2 size={16} /> Deshacer último evento
            </button>
            <button
              type="button"
              className="btn text-white fw-bold"
              style={{ backgroundColor: '#1E0A3C' }}
              onClick={handleFinish}
            >
              Finalizar partido
            </button>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white h-100">
          <h2 className="h5 fw-bold mb-3" style={{ color: '#1E0A3C' }}>
            Historial del partido
          </h2>
          {matchEvents.length === 0 ? (
            <p className="text-muted small mb-0">Aún no hay eventos. Registra el primer gol o tarjeta.</p>
          ) : (
            <ul className="list-unstyled d-flex flex-column gap-2 overflow-auto mb-0" style={{ maxHeight: '420px' }}>
              {matchEvents.map((evt) => (
                <li key={evt.id} className="d-flex align-items-start gap-2 pb-2 border-bottom small text-dark fw-medium">
                  <span className={`badge ${EVENT_BADGE[evt.type]} flex-shrink-0`}>{evt.minute}&apos;</span>
                  <span>{formatEvent(evt, match)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
