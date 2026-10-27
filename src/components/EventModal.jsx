import { useState } from 'react';
import { Form } from 'react-bootstrap';
import FormModal, { Field } from './FormModal';
import { EVENT_TYPES } from '../data/constants';

// Registra un evento del acta eligiendo a los jugadores del plantel convocado.
export default function EventModal({ match, side, type, players, teamName, onSave, onHide }) {
  const teamId = side === 'home' ? match.homeId : match.awayId;
  const lineupIds = match.lineup?.[side] ?? [];
  const byNumber = (a, b) => a.number - b.number;
  const onField = players.filter((p) => lineupIds.includes(p.id)).sort(byNumber);
  const bench = players.filter((p) => p.teamId === teamId && !lineupIds.includes(p.id)).sort(byNumber);

  const [playerId, setPlayerId] = useState('');
  const [assistId, setAssistId] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [errors, setErrors] = useState({});

  const label = (p) => `#${p.number} ${p.name}`;
  const isSub = type === 'sustitucion';
  const isGoal = type === 'gol';

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    if (!playerId) found.playerId = isSub ? 'Elige quién sale.' : 'Elige al jugador.';
    if (isSub && !relatedId) found.relatedId = 'Elige quién entra.';
    if (isGoal && assistId && assistId === playerId) found.assistId = 'El asistente debe ser otro jugador.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSave({
      type,
      side,
      playerId: Number(playerId),
      assistId: isGoal && assistId ? Number(assistId) : null,
      relatedId: isSub ? Number(relatedId) : null,
    });
  };

  return (
    <FormModal title={`${EVENT_TYPES[type].label}: ${teamName(teamId)}`} onHide={onHide} onSubmit={handleSubmit} submitLabel="Registrar">
      <Field id="evento-jugador" label={isSub ? 'Jugador que sale' : isGoal ? 'Autor del gol' : 'Jugador'} error={errors.playerId}>
        <Form.Select value={playerId} onChange={(e) => setPlayerId(e.target.value)} isInvalid={Boolean(errors.playerId)} autoFocus>
          <option value="">Selecciona un jugador</option>
          {onField.map((p) => (
            <option key={p.id} value={p.id}>{label(p)}</option>
          ))}
        </Form.Select>
      </Field>

      {isGoal && (
        <Field id="evento-asistente" label="Asistencia (opcional)" error={errors.assistId}>
          <Form.Select value={assistId} onChange={(e) => setAssistId(e.target.value)} isInvalid={Boolean(errors.assistId)}>
            <option value="">Sin asistencia</option>
            {onField.filter((p) => String(p.id) !== playerId).map((p) => (
              <option key={p.id} value={p.id}>{label(p)}</option>
            ))}
          </Form.Select>
        </Field>
      )}

      {isSub && (
        <Field id="evento-entra" label="Jugador que entra" error={errors.relatedId} hint={bench.length === 0 ? 'No quedan jugadores en el banco.' : undefined}>
          <Form.Select value={relatedId} onChange={(e) => setRelatedId(e.target.value)} isInvalid={Boolean(errors.relatedId)} disabled={bench.length === 0}>
            <option value="">Selecciona un jugador</option>
            {bench.map((p) => (
              <option key={p.id} value={p.id}>{label(p)}</option>
            ))}
          </Form.Select>
        </Field>
      )}

      <p className="text-muted small mb-0">Se registra en el minuto {match.minute}&apos; del partido.</p>
    </FormModal>
  );
}
