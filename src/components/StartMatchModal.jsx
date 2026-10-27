import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import FormModal from './FormModal';

// Convocatoria: por defecto juegan todos los inscritos; se desmarca a quien no llegó.
export default function StartMatchModal({ match, players, teamName, onStart, onHide }) {
  const rosterOf = (teamId) => players.filter((p) => p.teamId === teamId).sort((a, b) => a.number - b.number);
  const [lineup, setLineup] = useState(() => ({
    home: rosterOf(match.homeId).map((p) => p.id),
    away: rosterOf(match.awayId).map((p) => p.id),
  }));
  const [error, setError] = useState('');

  const toggle = (side, id) =>
    setLineup((prev) => ({ ...prev, [side]: prev[side].includes(id) ? prev[side].filter((x) => x !== id) : [...prev[side], id] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lineup.home.length === 0 || lineup.away.length === 0) {
      setError('Cada equipo necesita al menos un jugador convocado.');
      return;
    }
    onStart(match.id, lineup);
  };

  const column = (side, teamId) => (
    <div className="col-12 col-md-6">
      <h3 className="h6 fw-bold text-dark">{teamName(teamId)}</h3>
      {rosterOf(teamId).length === 0 && <p className="text-muted small mb-0">El equipo no tiene jugadores registrados.</p>}
      {rosterOf(teamId).map((p) => (
        <div className="form-check" key={p.id}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`conv-${side}-${p.id}`}
            checked={lineup[side].includes(p.id)}
            onChange={() => toggle(side, p.id)}
          />
          <label className="form-check-label" htmlFor={`conv-${side}-${p.id}`}>
            #{p.number} {p.name} <span className="text-muted small">({p.position})</span>
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <FormModal title="Iniciar partido" icon={PlayCircle} size="lg" onHide={onHide} onSubmit={handleSubmit} submitLabel="Iniciar partido">
      <p className="mb-0 text-dark">
        <strong>{teamName(match.homeId)}</strong> vs <strong>{teamName(match.awayId)}</strong>. Marca los jugadores convocados.
      </p>
      <div className="row g-4">
        {column('home', match.homeId)}
        {column('away', match.awayId)}
      </div>
      {error && <div className="alert alert-danger py-2 small mb-0" role="alert">{error}</div>}
    </FormModal>
  );
}
