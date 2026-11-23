import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { deportivosService } from '../services/deportivos.service';
import { formatDateTime } from '../utils/dates';
import { PAYMENT_BADGE, formatCLP } from '../utils/payments';

// RF-38 a RF-41: cobros de inscripción generados con Flow y su estado.
export default function Pagos() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    deportivosService.getPagos()
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = payments.filter((p) => p.estado === 'PAGADO').reduce((sum, p) => sum + Number(p.monto), 0);

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#1E0A3C' }}><CreditCard size={22} /> Pagos de inscripción</h2>
          <p className="text-muted small mb-0">Los cobros se generan desde la ficha de cada equipo y se pagan en Flow. Recaudado: <strong>{formatCLP(total)}</strong></p>
        </div>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="table-responsive">
        <table className="table table-hover align-middle border">
          <thead className="table-light">
            <tr><th>Fecha</th><th>Equipo</th><th>Torneo</th><th className="text-end">Monto</th><th className="text-center">Estado</th><th className="text-end">Comprobante</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center text-muted py-4">Cargando…</td></tr>}
            {!loading && payments.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">Aún no hay cobros generados.</td></tr>}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="small text-nowrap">{formatDateTime(p.fecha)}</td>
                <td className="fw-semibold">{p.equipo ?? '—'}</td>
                <td className="text-secondary">{p.torneo ?? '—'}</td>
                <td className="text-end">{formatCLP(p.monto)}</td>
                <td className="text-center"><span className={`badge ${PAYMENT_BADGE[p.estado] ?? 'bg-secondary'}`}>{p.estado}</span></td>
                <td className="text-end">
                  <Link to={`/pagos/${p.id}`} className="btn btn-sm btn-outline-dark">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
