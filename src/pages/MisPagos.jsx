import { useCallback, useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { deportivosService as api } from '../services/deportivos.service';
import { useAuth } from '../hooks/useAuth';
import { formatCLP } from '../utils/payments';
import { formatDateShort } from '../utils/dates';

const BRAND = '#1E0A3C';
const LIQ_BADGE = { PENDIENTE: 'bg-warning text-dark', PAGADA: 'bg-primary', RECIBIDA: 'bg-success', OBSERVADA: 'bg-danger', ANULADA: 'bg-secondary' };

// Árbitros y estadígrafos: partidos por cobrar, liquidaciones y confirmación de recepción.
export default function MisPagos() {
  const { user, updateProfile } = useAuth();
  const [pending, setPending] = useState(null);
  const [list, setList] = useState([]);
  const [fee, setFee] = useState(user?.fee ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.getMisPendientes().then(setPending).catch((e) => setError(e.message));
    api.getLiquidaciones().then((rows) => setList(rows.filter((l) => l.oficial_id === user?.id))).catch(() => {});
  }, [user?.id]);
  useEffect(() => { load(); }, [load]);

  const confirm = async (l, conforme) => {
    const observacion = conforme ? null : window.prompt('¿Qué no cuadra en este pago?');
    if (!conforme && !observacion) return;
    try {
      await api.confirmarLiquidacion(l.id, conforme, observacion);
      setMessage(conforme ? 'Recepción confirmada.' : 'Observación enviada al organizador.');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <h2 className="h4 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: BRAND }}><Wallet size={22} /> Mis pagos</h2>
        <p className="text-muted small mb-3">Partidos arbitrados o registrados con el acta cerrada, lo que tienes por cobrar y las liquidaciones del organizador.</p>
        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
        {message && <div className="alert alert-success py-2 small" role="status">{message}</div>}

        <form className="input-group input-group-sm mb-3" style={{ maxWidth: '360px' }} onSubmit={async (e) => { e.preventDefault(); const r = await updateProfile({ tarifaPartido: fee === '' ? null : Number(fee) }); setMessage(r.ok ? 'Tarifa guardada.' : ''); setError(r.ok ? '' : r.error); }}>
          <span className="input-group-text">Mi tarifa por partido $</span>
          <input type="number" min="0" step="500" className="form-control" aria-label="Tarifa por partido" value={fee} onChange={(e) => setFee(e.target.value)} />
          <button type="submit" className="btn btn-outline-dark">Guardar</button>
        </form>

        <div className="row g-3">
          <div className="col-6 col-md-3"><div className="p-3 bg-light rounded-3 border"><span className="small text-muted d-block">Partidos por cobrar</span><span className="h4 fw-bold">{pending?.cantidad ?? 0}</span></div></div>
          <div className="col-6 col-md-3"><div className="p-3 bg-light rounded-3 border"><span className="small text-muted d-block">Monto por cobrar</span><span className="h4 fw-bold">{formatCLP(pending?.total ?? 0)}</span></div></div>
        </div>
        {pending?.partidos?.length > 0 && (
          <ul className="list-unstyled small mt-3 mb-0">
            {pending.partidos.map((p) => (
              <li key={`${p.partido_id}-${p.funcion}`} className="border-bottom py-1 d-flex justify-content-between">
                <span>{formatDateShort(String(p.fecha_partido).slice(0, 10))} · {p.torneo} · {p.local} vs {p.visita} ({p.funcion === 'ARBITRO' ? 'árbitro' : 'estadígrafo'})</span>
                <span>{formatCLP(p.tarifa)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <h3 className="h6 fw-bold mb-2" style={{ color: BRAND }}>Mis liquidaciones</h3>
        <div className="table-responsive">
          <table className="table align-middle small">
            <thead className="table-light"><tr><th>#</th><th>Organizador</th><th>Partidos</th><th className="text-end">Total</th><th>Pago</th><th className="text-center">Estado</th><th /></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-3">Aún no tienes liquidaciones.</td></tr>}
              {list.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.organizador ?? '—'}<span className="d-block text-muted">{l.torneo ?? ''}</span></td>
                  <td>{l.cantidad_partidos}</td>
                  <td className="text-end">{formatCLP(l.monto_total)}</td>
                  <td>{l.medio_pago ? `${l.medio_pago}${l.referencia ? ` · ${l.referencia}` : ''}` : '—'}</td>
                  <td className="text-center"><span className={`badge ${LIQ_BADGE[l.estado]}`}>{l.estado}</span></td>
                  <td className="text-end text-nowrap">
                    {l.estado === 'PAGADA' && (
                      <>
                        <button type="button" className="btn btn-sm btn-success me-1" onClick={() => confirm(l, true)}>Recibido</button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirm(l, false)}>Observar</button>
                      </>
                    )}
                    {l.estado === 'PAGADA' || <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => window.print()}>Imprimir</button>}
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
