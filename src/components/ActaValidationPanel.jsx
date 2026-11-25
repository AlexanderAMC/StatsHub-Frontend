import { useState } from 'react';
import { deportivosService as api } from '../services/deportivos.service';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { MATCH_STATUS } from '../data/constants';
import { formatDateShort } from '../utils/dates';

// RF-31: el árbitro asignado escribe su informe y valida (firma) el acta cerrada.
export default function ActaValidationPanel() {
  const { user } = useAuth();
  const { matches, teamName, reload } = useData();
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('');

  const pending = matches.filter((m) => m.status === MATCH_STATUS.FINISHED && m.refereeId === user?.id && !m.validatedAt);
  if (pending.length === 0) return null;

  const submit = async (m) => {
    const informe = (drafts[m.id] ?? '').trim();
    if (!informe) return setMessage('Escribe el informe antes de validar.');
    try {
      await api.enviarInforme(m.id, informe);
      setMessage('Acta validada. El organizador fue notificado.');
      reload();
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <h2 className="h5 fw-bold mb-1" style={{ color: '#1E0A3C' }}>Actas por validar</h2>
      <p className="text-muted small">Como árbitro, registra tu informe (incidentes, expulsiones, observaciones) y valida el acta.</p>
      {message && <div className="alert alert-info py-2 small">{message}</div>}
      {pending.map((m) => (
        <div key={m.id} className="border rounded-3 p-3 mb-2">
          <div className="fw-semibold mb-2">
            {teamName(m.homeId)} {m.scoreHome} - {m.scoreAway} {teamName(m.awayId)}
            <span className="text-muted small fw-normal ms-2">{formatDateShort(m.date)}</span>
          </div>
          <textarea className="form-control form-control-sm mb-2" rows={3} aria-label="Informe arbitral" placeholder="Informe arbitral…" value={drafts[m.id] ?? ''} onChange={(e) => setDrafts({ ...drafts, [m.id]: e.target.value })} />
          <button type="button" className="btn btn-sm text-white" style={{ backgroundColor: '#1E0A3C' }} onClick={() => submit(m)}>Validar acta</button>
        </div>
      ))}
    </div>
  );
}
