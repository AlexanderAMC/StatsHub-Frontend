import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BarChart2, Check, Circle, Eye, EyeOff, FileText, Lock, Mail, Radio, User,
} from 'lucide-react';
import logoStatsHub from '../assets/logo.jpg';
import { LOGIN_PREVIEW } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';

const BRAND = '#1E0A3C';
const AMBER = '#F59E0B';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURES = [
  { icon: Radio, title: 'Marcadores en vivo', text: 'Sigue cada partido minuto a minuto.' },
  { icon: FileText, title: 'Actas digitales', text: 'Goles y tarjetas registrados al instante.' },
  { icon: BarChart2, title: 'Posiciones automáticas', text: 'La tabla se actualiza sola.' },
];

const COPY = {
  login: { eyebrow: 'Bienvenido', title: 'Inicia sesión', text: 'Entra con tu cuenta para registrar actas y gestionar torneos.' },
  register: { eyebrow: 'Únete', title: 'Crea tu cuenta', text: 'Regístrate para seguir tus torneos, recibir avisos y exportar reportes.' },
  recover: { eyebrow: 'Recuperar acceso', title: 'Restablece tu contraseña', text: 'Te enviaremos las instrucciones al correo de tu cuenta.' },
};

const passwordChecks = (password) => [
  { ok: password.length >= 8, label: 'Mínimo 8 caracteres' },
  { ok: /[a-z]/.test(password) && /[A-Z]/.test(password), label: 'Mayúsculas y minúsculas' },
  { ok: /\d/.test(password), label: 'Al menos un número' },
];

function PitchLines() {
  const line = (delay) => ({ '--d': `${delay}s` });
  return (
    <svg
      className="position-absolute top-0 start-0 w-100 h-100"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ opacity: 0.13 }}
    >
      <g fill="none" stroke={AMBER} strokeWidth="2">
        <rect className="pitch-line" pathLength="1" style={line(0.1)} x="40" y="40" width="720" height="820" rx="8" />
        <line className="pitch-line" pathLength="1" style={line(0.6)} x1="40" y1="450" x2="760" y2="450" />
        <circle className="pitch-line" pathLength="1" style={line(0.9)} cx="400" cy="450" r="110" />
        <rect className="pitch-line" pathLength="1" style={line(1.2)} x="230" y="40" width="340" height="140" />
        <rect className="pitch-line" pathLength="1" style={line(1.4)} x="320" y="40" width="160" height="60" />
        <rect className="pitch-line" pathLength="1" style={line(1.2)} x="230" y="720" width="340" height="140" />
        <rect className="pitch-line" pathLength="1" style={line(1.4)} x="320" y="800" width="160" height="60" />
      </g>
      <circle className="anim-fade-in" style={{ '--d': '1.6s' }} cx="400" cy="450" r="5" fill={AMBER} />
    </svg>
  );
}

function AuthField({ id, label, icon: Icon, error, invalid, right, ...inputProps }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold text-dark">{label}</label>
      <div className={`input-group input-group-lg login-field ${error || invalid ? 'has-error' : ''}`}>
        <span className="input-group-text bg-white border-end-0 text-muted">
          <Icon size={18} aria-hidden="true" />
        </span>
        <input
          id={id}
          className={`form-control border-start-0 ps-0 ${right ? 'border-end-0' : ''}`}
          aria-invalid={Boolean(error || invalid)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        {right}
      </div>
      {error && <div id={`${id}-error`} className="field-error text-danger small mt-1">{error}</div>}
    </div>
  );
}

function PasswordToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      className="btn bg-white border-start-0 text-muted"
      onClick={onToggle}
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function SubmitButton({ busy, busyLabel, children }) {
  return (
    <button
      type="submit"
      className="btn btn-lg btn-lift text-white fw-bold w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
      style={{ backgroundColor: BRAND }}
      disabled={busy}
    >
      {busy ? (
        <>
          <span className="spinner-border spinner-border-sm" aria-hidden="true" /> {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function SuccessMark({ title, text }) {
  return (
    <div className="text-center py-4" role="status">
      <svg width="76" height="76" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="success-circle" pathLength="1" cx="26" cy="26" r="24" fill="none" stroke="#198754" strokeWidth="3" />
        <path className="success-check" pathLength="1" d="M14 27l8 8 16-17" fill="none" stroke="#198754" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="h5 fw-bold mt-3 anim-fade-up" style={{ color: BRAND, '--d': '0.7s' }}>{title}</h3>
      <p className="text-muted mb-0 anim-fade-up" style={{ '--d': '0.85s' }}>{text}</p>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = passwordChecks(password);
  const score = checks.filter((c) => c.ok).length;
  const level = ['Muy débil', 'Débil', 'Media', 'Fuerte'][score];
  const color = ['#dc3545', '#dc3545', AMBER, '#198754'][score];
  return (
    <div className="mb-3">
      <div className="strength-track" aria-hidden="true">
        <div className="strength-bar" style={{ width: `${(score / 3) * 100}%`, backgroundColor: color }} />
      </div>
      <div className="d-flex justify-content-between small mt-1" aria-live="polite">
        <span className="text-muted">Seguridad de la contraseña</span>
        <span className="fw-semibold" style={{ color }}>{password ? level : ''}</span>
      </div>
      <ul className="list-unstyled small mb-0 mt-1 d-flex flex-column gap-1">
        {checks.map((c) => (
          <li key={c.label} className={`d-flex align-items-center gap-2 ${c.ok ? 'text-success' : 'text-muted'}`}>
            {c.ok ? <Check size={14} /> : <Circle size={14} />} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoginForm({ onRecover }) {
  const { login, sessionNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  const fail = (message) => {
    setError(message);
    setShake(true);
    setBusy(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      fail('Ingresa tu correo y tu contraseña.');
      return;
    }
    setError('');
    setBusy(true);
    // login es async: hay que esperar el resultado para mostrar el error real del servidor.
    // Si va bien, la sesión cambia y <Login> redirige, así que no hace falta hacer nada más.
    const result = await login(email.trim(), password);
    if (!result.ok) fail(result.error || 'No se pudo iniciar sesión.');
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className={shake ? 'shake' : ''} onAnimationEnd={() => setShake(false)}>
        <AuthField
          id="login-email" label="Correo" icon={Mail} type="email" placeholder="nombre@correo.cl"
          autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} invalid={Boolean(error)}
        />
        <AuthField
          id="login-password" label="Contraseña" icon={Lock} type={showPassword ? 'text' : 'password'}
          placeholder="Tu contraseña" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} invalid={Boolean(error)}
          right={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />

        <div role="alert" aria-live="polite">
          {error && <div className="alert alert-danger field-error py-2 small mb-3">{error}</div>}
          {!error && sessionNotice && <div className="alert alert-warning py-2 small mb-3">{sessionNotice}</div>}
        </div>

        <div className="d-flex justify-content-end mb-1">
          <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={onRecover}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <SubmitButton busy={busy} busyLabel="Verificando…">
          Iniciar sesión <ArrowRight size={18} aria-hidden="true" />
        </SubmitButton>
      </form>
    </>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '', acceptPrivacy: false });
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState('idle');

  const setField = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === 'email') setServerError('');
  };

  const validate = () => {
    const found = {};
    if (values.name.trim().length < 3) found.name = 'Ingresa tu nombre completo.';
    if (!EMAIL_RE.test(values.email.trim())) found.email = 'Ingresa un correo válido.';
    if (!passwordChecks(values.password).every((c) => c.ok)) found.password = 'La contraseña no cumple los requisitos.';
    if (values.confirm !== values.password) found.confirm = 'Las contraseñas no coinciden.';
    if (!values.acceptPrivacy) found.acceptPrivacy = 'Debes aceptar la política de privacidad para crear la cuenta.';
    return found;
  };

  const errors = attempted ? { ...validate(), ...(serverError ? { email: serverError } : {}) } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    const found = validate();
    if (Object.keys(found).length > 0) {
      setShake(true);
      return;
    }
    setServerError('');
    setStatus('loading');
    // El servidor es quien sabe si el correo ya existe (409): solo se anuncia éxito si responde bien.
    const result = await register(values);
    if (!result.ok) {
      setStatus('idle');
      setServerError(result.error || 'No se pudo crear la cuenta.');
      setShake(true);
      return;
    }
    setStatus('success');
  };

  if (status === 'success') {
    return <SuccessMark title="¡Cuenta creada!" text="Entrando a StatsHub Deportivo…" />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={shake ? 'shake' : ''} onAnimationEnd={() => setShake(false)}>
      <AuthField
        id="reg-name" label="Nombre completo" icon={User} type="text" placeholder="Nombre y apellido"
        autoComplete="name" value={values.name} onChange={setField('name')} error={errors.name}
      />
      <AuthField
        id="reg-email" label="Correo" icon={Mail} type="email" placeholder="nombre@correo.cl"
        autoComplete="email" value={values.email} onChange={setField('email')} error={errors.email}
      />
      <AuthField
        id="reg-password" label="Contraseña" icon={Lock} type={showPassword ? 'text' : 'password'}
        placeholder="Crea una contraseña segura" autoComplete="new-password" value={values.password}
        onChange={setField('password')} error={errors.password}
        right={<PasswordToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
      />
      <PasswordStrength password={values.password} />
      <AuthField
        id="reg-confirm" label="Confirmar contraseña" icon={Lock} type={showPassword ? 'text' : 'password'}
        placeholder="Repite la contraseña" autoComplete="new-password" value={values.confirm}
        onChange={setField('confirm')} error={errors.confirm}
      />
      {/* RNF-11 (Ley 19.628): aceptación explícita del tratamiento de datos personales. */}
      <div className="form-check mb-2">
        <input
          id="reg-privacidad" type="checkbox" className={`form-check-input ${errors.acceptPrivacy ? 'is-invalid' : ''}`}
          checked={values.acceptPrivacy}
          onChange={(e) => setValues((prev) => ({ ...prev, acceptPrivacy: e.target.checked }))}
          aria-describedby="reg-privacidad-texto"
        />
        <label htmlFor="reg-privacidad" className="form-check-label small text-dark" id="reg-privacidad-texto">
          Acepto la política de privacidad: StatsHub usa mis datos (nombre, correo y estadísticas deportivas) solo para la
          gestión de la liga, conforme a la Ley N.º 19.628. Puedo solicitar su rectificación o eliminación.
        </label>
        {errors.acceptPrivacy && <div className="invalid-feedback d-block">{errors.acceptPrivacy}</div>}
      </div>
      <SubmitButton busy={status === 'loading'} busyLabel="Creando cuenta…">
        Crear cuenta <ArrowRight size={18} aria-hidden="true" />
      </SubmitButton>
      <p className="small text-muted text-center mt-2 mb-0">Las cuentas nuevas empiezan con rol de espectador.</p>
    </form>
  );
}

function RecoverForm() {
  const { recoverPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Ingresa un correo válido.');
      setShake(true);
      return;
    }
    setError('');
    setStatus('loading');
    const result = await recoverPassword(email.trim());
    // El enlace solo llega al correo del titular: nunca se entrega en el navegador.
    if (result.ok) setStatus('sent');
    else {
      setStatus('idle');
      setError(result.error);
    }
  };

  if (status === 'sent') {
    return (
      <SuccessMark
        title="Revisa tu correo"
        text="Si la cuenta existe, te enviamos las instrucciones para restablecer tu contraseña."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={shake ? 'shake' : ''} onAnimationEnd={() => setShake(false)}>
      <AuthField
        id="rec-email" label="Correo de tu cuenta" icon={Mail} type="email" placeholder="nombre@correo.cl"
        autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} error={error}
      />
      <SubmitButton busy={status === 'loading'} busyLabel="Enviando…">
        Enviar instrucciones <ArrowRight size={18} aria-hidden="true" />
      </SubmitButton>
      <p className="small text-muted text-center mt-2 mb-0">El enlace llega solo a tu correo, sirve una vez y vence en 30 minutos.</p>
    </form>
  );
}

export default function Login() {
  const { user, isGuest, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [minute, setMinute] = useState(LOGIN_PREVIEW.minute);

  // El minuto del marcador de ejemplo avanza solo.
  useEffect(() => {
    const id = setInterval(() => setMinute((m) => (m >= 89 ? LOGIN_PREVIEW.minute : m + 1)), 5000);
    return () => clearInterval(id);
  }, []);

  const from = location.state?.from ?? { pathname: '/' };

  // Quien ya inició sesión no necesita ver el login. El invitado sí puede entrar para iniciar sesión.
  if (user && !isGuest) return <Navigate to={from} replace />;

  const handleGuest = () => {
    loginAsGuest();
    navigate('/', { replace: true });
  };

  const copy = COPY[mode];
  const delay = (s) => ({ '--d': `${s}s` });

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row">
      {/* Panel de marca */}
      <section
        className="position-relative overflow-hidden text-white d-flex flex-column justify-content-between gap-4 p-4 p-lg-5"
        style={{ backgroundColor: BRAND, flex: '1 1 55%' }}
      >
        <PitchLines />

        <div className="position-relative anim-fade-up" style={delay(0.05)}>
          <div className="bg-white rounded-3 shadow-sm p-2 d-inline-flex">
            <img src={logoStatsHub} alt="StatsHub Deportivo" style={{ maxHeight: '72px', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="position-relative py-lg-4">
          <p className="small fw-semibold text-uppercase mb-3 anim-fade-up" style={{ color: AMBER, letterSpacing: '0.18em', ...delay(0.15) }}>
            Gestión y analítica deportiva
          </p>
          <h1 className="font-display fw-bold mb-3 anim-fade-up" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 0.95, ...delay(0.25) }}>
            Cada jugada,
            <br />
            <span style={{ color: AMBER }}>al instante.</span>
          </h1>
          <p className="text-white-50 fs-5 mb-0 anim-fade-up" style={{ maxWidth: '480px', ...delay(0.4) }}>
            Administra torneos, registra actas en vivo y sigue las posiciones desde cualquier dispositivo.
          </p>

          <div className="login-scoreboard rounded-4 p-3 p-md-4 mt-4 d-none d-sm-block anim-fade-up" style={{ maxWidth: '520px', ...delay(0.55) }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="badge bg-danger rounded-pill px-3 py-2 d-inline-flex align-items-center">
                <span className="live-dot" aria-hidden="true" /> EN VIVO
              </span>
              <span className="small text-white-50" aria-live="off">Minuto {minute}&apos;</span>
            </div>
            <div className="d-flex align-items-center justify-content-between gap-3">
              <span className="fw-semibold text-start" style={{ width: '36%' }}>{LOGIN_PREVIEW.home}</span>
              <span key={minute} className="font-display fw-bold text-nowrap score-tick" style={{ fontSize: '2.75rem', lineHeight: 1, color: AMBER }}>
                {LOGIN_PREVIEW.scoreHome} - {LOGIN_PREVIEW.scoreAway}
              </span>
              <span className="fw-semibold text-end" style={{ width: '36%' }}>{LOGIN_PREVIEW.away}</span>
            </div>
          </div>
        </div>

        <ul className="position-relative list-unstyled row g-3 mb-0 d-none d-lg-flex">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="col-4 anim-fade-up" style={delay(0.7 + i * 0.12)}>
              <Icon size={20} style={{ color: AMBER }} aria-hidden="true" />
              <p className="fw-semibold small mb-1 mt-2">{title}</p>
              <p className="text-white-50 small mb-0">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Acceso */}
      <section className="d-flex flex-column justify-content-center bg-white p-4 p-lg-5" style={{ flex: '1 1 45%' }}>
        <div className="w-100 mx-auto anim-fade-up" style={{ maxWidth: '440px', ...delay(0.2) }}>
          {mode === 'recover' ? (
            <button type="button" className="btn btn-link p-0 mb-4 text-decoration-none d-inline-flex align-items-center gap-2" onClick={() => setMode('login')}>
              <ArrowLeft size={16} aria-hidden="true" /> Volver a iniciar sesión
            </button>
          ) : (
            <div className="auth-tabs mb-4" role="tablist" aria-label="Acceso" data-active={mode === 'login' ? 0 : 1}>
              <span className="auth-tabs-indicator" aria-hidden="true" />
              {[['login', 'Iniciar sesión'], ['register', 'Crear cuenta']].map(([id, label]) => (
                <button
                  key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={mode === id}
                  aria-controls="auth-panel" className={`auth-tab ${mode === id ? 'active' : ''}`} onClick={() => setMode(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div key={mode} id="auth-panel" role={mode === 'recover' ? undefined : 'tabpanel'} aria-labelledby={mode === 'recover' ? undefined : `tab-${mode}`} className="auth-panel">
            <p className="small fw-semibold text-uppercase text-muted mb-2" style={{ letterSpacing: '0.12em' }}>{copy.eyebrow}</p>
            <h2 className="h2 fw-bold mb-2" style={{ color: BRAND }}>{copy.title}</h2>
            <p className="text-muted mb-4">{copy.text}</p>

            {mode === 'login' && <LoginForm onRecover={() => setMode('recover')} />}
            {mode === 'register' && <RegisterForm />}
            {mode === 'recover' && <RecoverForm />}
          </div>

          <div className="d-flex align-items-center gap-3 my-4 text-muted small">
            <hr className="flex-grow-1 m-0" />
            <span>o</span>
            <hr className="flex-grow-1 m-0" />
          </div>

          <button type="button" className="btn btn-lg btn-lift btn-outline-dark w-100" onClick={handleGuest}>
            Entrar como invitado
          </button>
          <p className="text-muted small text-center mt-2 mb-0">Como invitado puedes ver marcadores, calendario, posiciones y estadísticas.</p>
        </div>
      </section>
    </div>
  );
}
