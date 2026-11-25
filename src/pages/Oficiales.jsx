import { useCallback, useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { deportivosService as api } from '../services/deportivos.service';
import { useData } from '../hooks/useData';
import { formatCLP } from '../utils/payments';
import { formatDateShort } from '../utils/dates';

const BRAND = '#1E0A3C';
const LIQ_BADGE = { PENDIENTE: 'bg-warning text-dark', PAGADA: 'bg-primary', RECIBIDA: 'bg-success', OBSERVADA: 'bg-danger', ANULADA: 'bg-secondary' };

// Pagos a árbitros y estadígrafos: partidos con acta cerrada × tarifa. Flow no paga a terceros:
// el organizador transfiere por su banco y aquí registra el pago y el comprobante.
export default function Oficiales() {
  const { referees, statsKeepers, tournaments } = useData();
  const officials = [...referees.map((r) => ({ ...r, rol: 'Árbitro' })), ...statsKeepers.map((s) => ({ ...s, rol: 'Estadígrafo' }))];
  const [oficial, setOficial] = useState('');
  const [torneo, setTorneo] = useState('');
  const [pending, setPending] = useState(null);
  const [tarifa, setTarifa] = useState('');
  const [list, setList] = useState([]);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadList = useCallback(() => api.getLiquidaciones().then(setList).catch((e) => setError(e.message)), []);
  useEffect(() => { loadList(); }, [loadList]);

  const run = async (fn, okText) => {
    setError('');
    setMessage('');
    try {
      const result = await fn();
      if (okText) setMessage(okText);
      return result;
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const calculate = async () => {
    const r = await run(() => api.getPendientesOficial(oficial, torneo));
    if (r) setPending(r);
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <h2 className="h4 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: BRAND }}><Flag size={22} /> Pagos a oficiales</h2>
        <p className="text-muted small mb-3">Calcula lo que corresponde pagar a cada árbitro o estadígrafo por los partidos con acta cerrada. Cada partido se paga una sola vez.</p>
        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
        {message && <div className="alert alert-success py-2 small" role="status">{message}</div>}

        <div className="row g-2 align-items-end mb-3">
          <div className="col-12 col-md-4">
            <label htmlFor="of-oficial" className="form-label small fw-semibold">Oficial</label>
            <select id="of-oficial" className="form-select form-select-sm" value={oficial} onChange={(e) => { setOficial(e.target.value); setPending(null); }}>
              <option value="">Selecciona</option>
              {officials.map((o) => <option key={`${o.rol}-${o.id}`} value={o.id}>{o.name} ({o.rol})</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="of-torneo" className="form-label small fw-semibold">Torneo</label>
            <select id="of-torneo" className="form-select form-select-sm" value={torneo} onChange={(e) => { setTorneo(e.target.value); setPending(null); }}>
              <option value="">Todos mis torneos</option>
              {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <button type="button" className="btn btn-sm text-white w-100" style={{ backgroundColor: BRAND }} disabled={!oficial} onClick={calculate}>Calcular pendiente</button>
          </div>
        </div>

        {oficial && torneo && (
          <div className="input-group input-group-sm mb-3" style={{ maxWidth: '420px' }}>
            <span className="input-group-text">Tarifa acordada en el torneo $</span>
            <input type="number" min="0" step="500" className="form-control" aria-label="Tarifa acordada" value={tarifa} onChange={(e) => setTarifa(e.target.value)} />
            <button type="button" className="btn btn-outline-dark" disabled={tarifa === ''} onClick={async () => { if (await run(() => api.setTarifaOficial(Number(torneo), oficial, Number(tarifa)), 'Tarifa guardada.')) calculate(); }}>Guardar</button>
          </div>
        )}

        {pending && (
          <div className="p-3 bg-light rounded-3 border">
            {pending.cantidad === 0 ? (
              <p className="small text-muted mb-0">No hay partidos pendientes de pago para este oficial.</p>
            ) : (
              <>
                <ul className="list-unstyled small mb-2">
                  {pending.partidos.map((p) => (
                    <li key={`${p.partido_id}-${p.funcion}`} className="d-flex justify-content-between border-bottom py-1">
                      <span>{formatDateShort(String(p.fecha_partido).slice(0, 10))} · {p.local} vs {p.visita} <span className="text-muted">({p.funcion === 'ARBITRO' ? 'árbitro' : 'estadígrafo'})</span></span>
                      <span>{formatCLP(p.tarifa)}</span>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{pending.cantidad} partido(s) · Total {formatCLP(pending.total)}</strong>
                  <button type="button" className="btn btn-sm btn-success" onClick={async () => { if (await run(() => api.crearLiquidacion(oficial, torneo), 'Liquidación generada. El oficial fue notificado.')) { setPending(null); loadList(); } }}>Generar liquidación</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <h3 className="h6 fw-bold mb-2" style={{ color: BRAND }}>Liquidaciones</h3>
        <div className="table-responsive">
          <table className="table align-middle small">
            <thead className="table-light"><tr><th>#</th><th>Oficial</th><th>Partidos</th><th className="text-end">Total</th><th className="text-center">Estado</th><th className="text-end">Acción</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-3">Sin liquidaciones.</td></tr>}
              {list.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.oficial}<span className="d-block text-muted">{l.torneo ?? 'Varios torneos'}</span></td>
                  <td>{l.cantidad_partidos}</td>
                  <td className="text-end">{formatCLP(l.monto_total)}</td>
                  <td className="text-center"><span className={`badge ${LIQ_BADGE[l.estado]}`}>{l.estado}</span>{l.observacion && <span className="d-block text-danger">{l.observacion}</span>}</td>
                  <td className="text-end text-nowrap">
                    {['PENDIENTE', 'OBSERVADA'].includes(l.estado) && <button type="button" className="btn btn-sm btn-success me-1" onClick={() => setPaying({ id: l.id, medio_pago: 'Transferencia', referencia: '' })}>Registrar pago</button>}
                    {l.estado === 'PENDIENTE' && <button type="button" className="btn btn-sm btn-outline-danger" onClick={async () => { if (window.confirm('¿Anular la liquidación? Los partidos quedarán pendientes otra vez.') && await run(() => api.anularLiquidacion(l.id), 'Liquidación anulada.') !== null) loadList(); }}>Anular</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paying && (
          <form className="p-3 bg-light rounded-3 border d-flex flex-wrap gap-2 align-items-end" onSubmit={async (e) => { e.preventDefault(); if (await run(() => api.pagarLiquidacion(paying.id, { medio_pago: paying.medio_pago, referencia: paying.referencia }), 'Pago registrado. El oficial debe confirmar la recepción.')) { setPaying(null); loadList(); } }}>
            <span className="small fw-semibold w-100">Registrar pago de la liquidación #{paying.id}</span>
            <select className="form-select form-select-sm w-auto" aria-label="Medio de pago" value={paying.medio_pago} onChange={(e) => setPaying({ ...paying, medio_pago: e.target.value })}>
              <option>Transferencia</option><option>Efectivo</option><option>Depósito</option>
            </select>
            <input className="form-control form-control-sm w-auto" placeholder="N.º de operación" aria-label="Número de operación" value={paying.referencia} onChange={(e) => setPaying({ ...paying, referencia: e.target.value })} />
            <button type="submit" className="btn btn-sm btn-success">Confirmar pago</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPaying(null)}>Cancelar</button>
          </form>
        )}
      </div>
    </div>
  );
}
