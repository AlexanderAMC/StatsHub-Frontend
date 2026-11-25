import { useCallback, useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { deportivosService as api } from '../services/deportivos.service';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { PERMISSIONS } from '../data/users';
import { formatCLP } from '../utils/payments';
import { formatDateTime } from '../utils/dates';

const BRAND = '#1E0A3C';
const STATE_BADGE = { PENDIENTE: 'bg-warning text-dark', PAGADO: 'bg-success', ANULADO: 'bg-secondary' };

// Cobros a equipos: el organizador genera inscripciones y planillas; el equipo (dueño o entrenador) las paga con Flow.
export default function Cobros() {
  const { can } = useAuth();
  const { matches, teams, tournaments, teamName } = useData();
  const canCollect = can(PERMISSIONS.COLLECT);
  const [cobros, setCobros] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [planilla, setPlanilla] = useState({ partido: '', monto: 5000 });
  const [manual, setManual] = useState({ torneo: '', equipo: '', tipo: 'PLANILLA', concepto: '', monto: 5000 });

  const load = useCallback(() => api.getCobros().then(setCobros).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const act = async (fn, okText) => {
    setError('');
    setMessage('');
    try {
      const result = await fn();
      if (result?.url) return window.location.assign(result.url);
      setMessage(okText);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const torneoTeams = teams.filter((t) => String(t.tournamentId) === manual.torneo);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <h2 className="h4 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: BRAND }}><Receipt size={22} /> Cobros a equipos</h2>
        <p className="text-muted small mb-3">
          {canCollect ? 'Genera las planillas por partido o cobros de inscripción para los equipos de tus torneos.' : 'Cobros pendientes de tu equipo. Se pagan con Flow.'}
        </p>
        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
        {message && <div className="alert alert-success py-2 small" role="status">{message}</div>}

        {canCollect && (
          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-6">
              <form className="p-3 bg-light rounded-3 border h-100" onSubmit={(e) => { e.preventDefault(); act(() => api.createPlanillas(Number(planilla.partido), Number(planilla.monto)), 'Planillas generadas para ambos equipos.'); }}>
                <span className="fw-semibold small d-block mb-2">Planilla por partido (se cobra a ambos equipos)</span>
                <select className="form-select form-select-sm mb-2" aria-label="Partido" value={planilla.partido} onChange={(e) => setPlanilla({ ...planilla, partido: e.target.value })} required>
                  <option value="">Selecciona un partido</option>
                  {matches.map((m) => <option key={m.id} value={m.id}>{m.date} · {teamName(m.homeId)} vs {teamName(m.awayId)}</option>)}
                </select>
                <div className="input-group input-group-sm mb-2">
                  <span className="input-group-text">$</span>
                  <input type="number" min="350" step="100" className="form-control" aria-label="Monto por equipo" value={planilla.monto} onChange={(e) => setPlanilla({ ...planilla, monto: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-sm text-white" style={{ backgroundColor: BRAND }}>Generar planillas</button>
              </form>
            </div>
            <div className="col-12 col-lg-6">
              <form className="p-3 bg-light rounded-3 border h-100" onSubmit={(e) => { e.preventDefault(); act(() => api.createCobro({ torneo_id: Number(manual.torneo), equipo_id: Number(manual.equipo), tipo: manual.tipo, concepto: manual.concepto, monto: Number(manual.monto) }), 'Cobro creado.'); }}>
                <span className="fw-semibold small d-block mb-2">Cobro a un equipo</span>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <select className="form-select form-select-sm" aria-label="Torneo" value={manual.torneo} onChange={(e) => setManual({ ...manual, torneo: e.target.value, equipo: '' })} required>
                      <option value="">Torneo</option>
                      {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select className="form-select form-select-sm" aria-label="Equipo" value={manual.equipo} onChange={(e) => setManual({ ...manual, equipo: e.target.value })} required>
                      <option value="">Equipo</option>
                      {torneoTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select className="form-select form-select-sm" aria-label="Tipo" value={manual.tipo} onChange={(e) => setManual({ ...manual, tipo: e.target.value })}>
                      <option value="PLANILLA">Planilla</option>
                      <option value="INSCRIPCION">Inscripción</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <input type="number" min="350" step="100" className="form-control form-control-sm" aria-label="Monto" value={manual.monto} onChange={(e) => setManual({ ...manual, monto: e.target.value })} />
                  </div>
                </div>
                <input className="form-control form-control-sm mb-2" placeholder="Concepto (ej. Planilla fecha 3)" aria-label="Concepto" value={manual.concepto} onChange={(e) => setManual({ ...manual, concepto: e.target.value })} required />
                <button type="submit" className="btn btn-sm text-white" style={{ backgroundColor: BRAND }}>Crear cobro</button>
              </form>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle border small">
            <thead className="table-light"><tr><th>Fecha</th><th>Equipo</th><th>Concepto</th><th className="text-end">Monto</th><th className="text-center">Estado</th><th className="text-end">Acción</th></tr></thead>
            <tbody>
              {cobros.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No hay cobros.</td></tr>}
              {cobros.map((c) => (
                <tr key={c.id}>
                  <td className="text-nowrap">{formatDateTime(c.creado_en)}</td>
                  <td className="fw-semibold">{c.equipo}<span className="d-block text-muted fw-normal">{c.torneo}</span></td>
                  <td>{c.concepto}</td>
                  <td className="text-end">{formatCLP(c.monto)}</td>
                  <td className="text-center"><span className={`badge ${STATE_BADGE[c.estado]}`}>{c.estado}</span></td>
                  <td className="text-end text-nowrap">
                    {c.estado === 'PENDIENTE' && (
                      <>
                        <button type="button" className="btn btn-sm btn-success me-1" onClick={() => act(() => api.pagarCobro(c.id))}>Pagar con Flow</button>
                        {canCollect && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('¿Anular este cobro?') && act(() => api.anularCobro(c.id), 'Cobro anulado.')}>Anular</button>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
