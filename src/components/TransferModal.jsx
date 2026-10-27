import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ArrowLeftRight } from 'lucide-react';
import FormModal, { Field } from './FormModal';

const FREE = 'libre';

export default function TransferModal({ player, teams, teamName, onConfirm, onHide }) {
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const options = teams.filter((t) => t.id !== player.teamId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!target) {
      setError('Elige el equipo de destino.');
      return;
    }
    onConfirm(target === FREE ? null : Number(target));
  };

  return (
    <FormModal title="Transferir jugador" icon={ArrowLeftRight} onHide={onHide} onSubmit={handleSubmit} submitLabel="Confirmar transferencia">
      <p className="mb-0 text-dark">
        <strong>{player.name}</strong> está en <strong>{teamName(player.teamId)}</strong>.
      </p>
      <Field id="transfer-destino" label="Equipo de destino" error={error}>
        <Form.Select value={target} onChange={(e) => { setTarget(e.target.value); setError(''); }} isInvalid={Boolean(error)} autoFocus>
          <option value="">Selecciona un equipo</option>
          {options.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
          {player.teamId !== null && <option value={FREE}>Sin equipo</option>}
        </Form.Select>
      </Field>
      <p className="text-muted small mb-0">La transferencia queda registrada en el historial del jugador.</p>
    </FormModal>
  );
}
