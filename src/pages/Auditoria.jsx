import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { deportivosService } from '../services/deportivos.service';
import { formatDateTime } from '../utils/dates';

const PAGE_SIZE = 50;
const ACTIONS = [
  'LOGIN', 'LOGOUT', 'CREAR_USUARIO', 'EDITAR_USUARIO', 'CAMBIAR_ROL', 'BLOQUEAR_USUARIO', 'ELIMINAR_USUARIO',
  'CAMBIO_PASSWORD', 'RESET_PASSWORD', 'CREAR_TORNEO', 'EDITAR_TORNEO', 'CANCELAR_TORNEO', 'ELIMINAR_TORNEO',
  'CREAR_EQUIPO', 'ELIMINAR_EQUIPO', 'TRANSFERIR_JUGADOR', 'ABRIR_ACTA', 'CERRAR_ACTA', 'GENERAR_COBRO', 'PAGO_CONFIRMADO',
];

// RF-06: bitácora de acciones críticas (solo administradores).
export default function Auditoria() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [data, setData] = useState({ total: 0, registros: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    deportivosService
      .getAuditoria({ pagina: page, limite: PAGE_SIZE, accion: action })
      .then((result) => { if (!cancelled) { setData(result); setError(''); } })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, action]);

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  // La carga se marca al cambiar de página o filtro (no dentro del efecto).
  const goTo = (nextPage, nextAction = action) => {
    setLoading(true);
    setAction(nextAction);
    setPage(nextPage);
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold m-0 d-flex align-items-center gap-2" style={{ color: '#1E0A3C' }}><ShieldCheck size={22} /> Bitácora de auditoría</h2>
          <p className="text-muted small mb-0">Registro de acciones críticas: accesos, cambios de usuarios, actas y pagos. {data.total} registros.</p>
        </div>
        <select className="form-select form-select-sm w-auto" aria-label="Filtrar por acción" value={action} onChange={(e) => goTo(1, e.target.value)}>
          <option value="">Todas las acciones</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a.replaceAll('_', ' ').toLowerCase()}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle border small">
          <thead className="table-light">
            <tr><th>Fecha</th><th>Acción</th><th>Usuario</th><th>Registro</th><th>IP</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center text-muted py-4">Cargando…</td></tr>}
            {!loading && data.registros.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">Sin registros.</td></tr>}
            {!loading && data.registros.map((r) => (
              <tr key={r.id}>
                <td className="text-nowrap">{formatDateTime(r.fecha)}</td>
                <td><span className="badge bg-light text-dark border">{r.accion}</span></td>
                <td>{r.usuario_nombre ?? 'Sistema'}<span className="d-block text-muted">{r.usuario_correo ?? ''}</span></td>
                <td className="text-muted">{r.tabla_afectada}{r.registro_id ? ` #${r.registro_id}` : ''}</td>
                <td className="text-muted">{r.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <button type="button" className="btn btn-sm btn-outline-dark" disabled={page <= 1} onClick={() => goTo(page - 1)}>Anterior</button>
        <span className="small text-muted">Página {page} de {pages}</span>
        <button type="button" className="btn btn-sm btn-outline-dark" disabled={page >= pages} onClick={() => goTo(page + 1)}>Siguiente</button>
      </div>
    </div>
  );
}
