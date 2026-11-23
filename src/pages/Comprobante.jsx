import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Printer, Receipt } from 'lucide-react';
import { deportivosService } from '../services/deportivos.service';
import { useData } from '../hooks/useData';
import { formatDateTime } from '../utils/dates';
import { PAYMENT_BADGE, formatCLP } from '../utils/payments';

const RESULT_TEXT = {
  PAGADO: { cls: 'alert-success', text: '¡Pago recibido! La inscripción del equipo quedó confirmada.' },
  PENDIENTE: { cls: 'alert-warning', text: 'Flow todavía está procesando el pago. El estado se actualizará automáticamente.' },
  RECHAZADO: { cls: 'alert-danger', text: 'El pago fue rechazado. Puedes generar un nuevo cobro desde la ficha del equipo.' },
  ANULADO: { cls: 'alert-secondary', text: 'El pago fue anulado.' },
};

// RF-41: comprobante digital de la transacción. También es la página de retorno desde Flow (/pagos/resultado?orden=…).
export default function Comprobante() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const reference = id ?? params.get('orden');
  const isReturn = !id;
  const { reload } = useData();
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) return;
    deportivosService.getPago(reference).then(setPayment).catch((err) => setError(err.message));
    if (isReturn) reload(); // el estado del equipo pudo cambiar a "Inscrito"
  }, [reference, isReturn, reload]);

  const shownError = reference ? error : 'No se recibió la referencia del pago.';
  if (shownError) {
    return (
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="alert alert-danger mb-3">{shownError}</div>
        <Link to="/equipos" className="btn btn-outline-dark align-self-start">Volver a equipos</Link>
      </div>
    );
  }
  if (!payment) return <div className="text-muted p-4" role="status">Cargando comprobante…</div>;

  const result = RESULT_TEXT[payment.estado];

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: '640px' }}>
      {isReturn && result && <div className={`alert ${result.cls} mb-0 no-print`} role="status">{result.text}</div>}
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: '#1E0A3C' }}><Receipt size={22} /> Comprobante de pago</h2>
            <p className="text-muted small mb-0">{payment.liga?.nombre ?? 'StatsHub Deportivo'}</p>
          </div>
          <span className={`badge fs-6 ${PAYMENT_BADGE[payment.estado] ?? 'bg-secondary'}`}>{payment.estado}</span>
        </div>
        <dl className="row mb-0 small">
          <dt className="col-5 text-muted fw-normal">Orden de comercio</dt><dd className="col-7 fw-semibold">{payment.orden_comercio}</dd>
          <dt className="col-5 text-muted fw-normal">N.º de orden Flow</dt><dd className="col-7">{payment.flow_orden || '—'}</dd>
          <dt className="col-5 text-muted fw-normal">Concepto</dt><dd className="col-7">Inscripción de {payment.equipo} en {payment.torneo}</dd>
          <dt className="col-5 text-muted fw-normal">Monto</dt><dd className="col-7 fw-bold">{formatCLP(payment.monto)} CLP</dd>
          <dt className="col-5 text-muted fw-normal">Medio de pago</dt><dd className="col-7">{payment.medio_pago || '—'}</dd>
          <dt className="col-5 text-muted fw-normal">Generado</dt><dd className="col-7">{formatDateTime(payment.fecha)}</dd>
          <dt className="col-5 text-muted fw-normal">Pagado</dt><dd className="col-7">{payment.fecha_pago ? formatDateTime(payment.fecha_pago) : '—'}</dd>
          <dt className="col-5 text-muted fw-normal">Solicitado por</dt><dd className="col-7">{payment.solicitado_por ?? '—'}</dd>
        </dl>
        <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.75rem' }}>
          Pago procesado por Flow. StatsHub no almacena datos de tarjetas. Contacto: {payment.liga?.correo_contacto || 'la directiva de la liga'}.
        </p>
      </div>
      <div className="d-flex gap-2 no-print">
        <button type="button" className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>
        <Link to="/pagos" className="btn btn-outline-dark">Ver todos los pagos</Link>
      </div>
    </div>
  );
}
