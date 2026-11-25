import { useEffect, useState } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { deportivosService as api } from '../services/deportivos.service';
import { useAuth } from '../hooks/useAuth';
import { PERMISSIONS, PLAN_LABELS } from '../data/users';
import { formatCLP } from '../utils/payments';
import { formatDateShort } from '../utils/dates';

const BRAND = '#1E0A3C';
const PERIODS = [
  { id: 'SEMANA', label: 'Semanal', key: 'precio_semana', suffix: '/semana' },
  { id: 'MES', label: 'Mensual', key: 'precio_mes', suffix: '/mes' },
  { id: 'ANIO', label: 'Anual', key: 'precio_anio', suffix: '/año' },
];
const ICONS = { BASICO: Star, PRO: Zap, ULTRA: Crown };
const FEATURES = {
  BASICO: ['Goleadores, asistencias y Fair Play', 'Fichas completas de jugadores', 'Exportar reportes (Excel y PDF)'],
  PRO: ['Todo lo del plan Básico', 'Panel de rendimiento del equipo', 'Predicción de resultados con Machine Learning', 'Gestionar el plantel de tu equipo y pagar sus cobros'],
  ULTRA: ['Todo lo del plan Pro', 'Crear y administrar tus propios torneos', 'Fixture, actas, árbitros y estadígrafos', 'Cobrar inscripciones y planillas con Flow', 'Liquidar los pagos de tus oficiales'],
};

// Modelo freemium: cada persona desbloquea funciones con un plan (nunca la administración).
export default function Planes() {
  const { user, isGuest, can, refreshProfile } = useAuth();
  const [plans, setPlans] = useState([]);
  const [mine, setMine] = useState(null);
  const [period, setPeriod] = useState('MES');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const isAdmin = can(PERMISSIONS.MANAGE_USERS);

  useEffect(() => {
    api.getPlanes().then(setPlans).catch((e) => setError(e.message));
    if (user && !isGuest) {
      api.getMiSuscripcion().then(setMine).catch(() => {});
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async (codigo) => {
    setBusy(codigo);
    setError('');
    try {
      const { url } = await api.comprarPlan(codigo, period);
      window.location.assign(url);
    } catch (e) {
      setError(e.message);
      setBusy('');
    }
  };

  const current = mine?.plan;
  const periodInfo = PERIODS.find((p) => p.id === period);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
        <h2 className="h4 fw-bold mb-1" style={{ color: BRAND }}>Planes StatsHub</h2>
        <p className="text-muted small mb-3">
          Ver marcadores, calendario, posiciones y equipos es gratis. Desbloquea más funciones con un plan; se paga con Flow y se activa al instante.
        </p>
        {current && (
          <div className="alert alert-success py-2 small mb-3">
            Tienes el <strong>{current.nombre}</strong> vigente hasta el {formatDateShort(String(current.fin).slice(0, 10))}. Puedes renovarlo antes de que venza: el nuevo periodo se suma al actual.
          </div>
        )}
        {isGuest && <div className="alert alert-info py-2 small mb-3">Crea una cuenta gratuita (pantalla de inicio de sesión) para contratar un plan.</div>}
        <div className="btn-group mb-3" role="group" aria-label="Periodo de pago">
          {PERIODS.map((p) => (
            <button key={p.id} type="button" className={`btn btn-sm ${period === p.id ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setPeriod(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
        <div className="row g-3">
          {plans.filter((p) => p.activo !== false).map((plan) => {
            const Icon = ICONS[plan.codigo] ?? Star;
            const isCurrent = current?.plan_codigo === plan.codigo;
            const lower = current && current.nivel > plan.nivel;
            return (
              <div key={plan.codigo} className="col-12 col-lg-4">
                <div className={`border rounded-3 p-3 h-100 d-flex flex-column ${plan.codigo === 'PRO' ? 'border-warning border-2' : ''}`}>
                  <div className="d-flex align-items-center gap-2 mb-2" style={{ color: BRAND }}>
                    <Icon size={20} /> <h3 className="h5 fw-bold mb-0">{plan.nombre}</h3>
                    {plan.codigo === 'PRO' && <span className="badge bg-warning text-dark ms-auto">Recomendado</span>}
                  </div>
                  <p className="mb-2"><span className="fs-3 fw-bold">{formatCLP(plan[periodInfo.key])}</span> <span className="text-muted small">{periodInfo.suffix}</span></p>
                  <ul className="list-unstyled small d-flex flex-column gap-1 mb-3">
                    {(FEATURES[plan.codigo] ?? [plan.descripcion]).map((f) => (
                      <li key={f} className="d-flex gap-2"><Check size={16} className="text-success flex-shrink-0" /> {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button" className="btn text-white fw-bold mt-auto" style={{ backgroundColor: BRAND }}
                    disabled={isGuest || !user || lower || busy !== ''}
                    onClick={() => buy(plan.codigo)}
                  >
                    {busy === plan.codigo ? 'Redirigiendo a Flow…' : lower ? 'Incluido en tu plan' : isCurrent ? 'Renovar' : 'Contratar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mine?.historial?.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
          <h3 className="h6 fw-bold mb-2" style={{ color: BRAND }}>Mis suscripciones</h3>
          <ul className="list-unstyled small mb-0">
            {mine.historial.map((s) => (
              <li key={s.id} className="border-bottom py-1">
                {PLAN_LABELS[s.plan_codigo]} · {formatCLP(s.monto)} · {s.inicio ? `${formatDateShort(String(s.inicio).slice(0, 10))} → ${formatDateShort(String(s.fin).slice(0, 10))}` : s.estado}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAdmin && <AdminPlanes plans={plans} onSaved={setPlans} />}
    </div>
  );
}

// Administración: precios por periodo e indicadores de suscripciones.
function AdminPlanes({ plans, onSaved }) {
  const [summary, setSummary] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getResumenSuscripciones().then(setSummary).catch(() => {});
  }, []);

  const value = (plan, key) => drafts[plan.codigo]?.[key] ?? plan[key];
  const setValue = (codigo, key, v) => setDrafts((d) => ({ ...d, [codigo]: { ...d[codigo], [key]: v } }));

  const save = async (plan) => {
    try {
      const updated = await api.updatePlan(plan.codigo, {
        precio_semana: Number(value(plan, 'precio_semana')),
        precio_mes: Number(value(plan, 'precio_mes')),
        precio_anio: Number(value(plan, 'precio_anio')),
      });
      onSaved(plans.map((p) => (p.codigo === plan.codigo ? updated : p)));
      setMessage(`Precios del ${updated.nombre} guardados.`);
    } catch (e) {
      setMessage(e.message);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-3 p-md-4 bg-white">
      <h3 className="h6 fw-bold mb-3" style={{ color: BRAND }}>Administración de planes</h3>
      {summary && (
        <div className="row g-2 mb-3">
          {summary.planes.map((p) => (
            <div key={p.codigo} className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 border small">
                <span className="fw-semibold d-block">{p.nombre}</span>
                {p.activas} suscripciones vigentes · Ingresos {formatCLP(p.ingresos)}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="table-responsive">
        <table className="table align-middle small">
          <thead className="table-light"><tr><th>Plan</th><th>Semana</th><th>Mes</th><th>Año</th><th /></tr></thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.codigo}>
                <td className="fw-semibold">{plan.nombre}</td>
                {['precio_semana', 'precio_mes', 'precio_anio'].map((k) => (
                  <td key={k}>
                    <input type="number" min="0" step="10" className="form-control form-control-sm" style={{ maxWidth: '120px' }} aria-label={`${plan.nombre} ${k}`} value={value(plan, k)} onChange={(e) => setValue(plan.codigo, k, e.target.value)} />
                  </td>
                ))}
                <td><button type="button" className="btn btn-sm btn-dark" onClick={() => save(plan)}>Guardar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <div className="small text-muted">{message}</div>}
    </div>
  );
}
