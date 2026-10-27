import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart2, Eye, EyeOff, FileText, Lock, Mail, Radio } from 'lucide-react';
import logoStatsHub from '../assets/logo.jpg';
import { MATCH_STATUS } from '../data/constants';
import { INITIAL_MATCHES } from '../data/mockData';
import { ROLE_LABELS, USERS } from '../data/users';
import { useAuth } from '../hooks/useAuth';

const BRAND = '#1E0A3C';
const AMBER = '#F59E0B';

const FEATURES = [
  { icon: Radio, title: 'Marcadores en vivo', text: 'Sigue cada partido minuto a minuto.' },
  { icon: FileText, title: 'Actas digitales', text: 'Goles y tarjetas registrados al instante.' },
  { icon: BarChart2, title: 'Posiciones automáticas', text: 'La tabla se actualiza sola.' },
];

// Líneas de una cancha, de fondo y muy suaves.
function PitchLines() {
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
        <rect x="40" y="40" width="720" height="820" rx="8" />
        <line x1="40" y1="450" x2="760" y2="450" />
        <circle cx="400" cy="450" r="110" />
        <rect x="230" y="40" width="340" height="140" />
        <rect x="320" y="40" width="160" height="60" />
        <rect x="230" y="720" width="340" height="140" />
        <rect x="320" y="800" width="160" height="60" />
      </g>
      <circle cx="400" cy="450" r="5" fill={AMBER} />
    </svg>
  );
}

export default function Login() {
  const { user, isGuest, login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false); // NUEVO ESTADO

  const from = location.state?.from ?? { pathname: '/' };

  if (user && !isGuest) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y tu contraseña.');
      return;
    }
    
    setCargando(true);
    setError('');
    
    // Llamada real al backend
    const result = await login(email, password);
    
    setCargando(false);
    if (!result.ok) setError(result.error);
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row">
      {/* Panel de marca */}
      <section
        className="position-relative overflow-hidden text-white d-flex flex-column justify-content-between gap-4 p-4 p-lg-5"
        style={{ backgroundColor: BRAND, flex: '1 1 55%' }}
      >
        <PitchLines />

        <div className="position-relative">
          <div className="bg-white rounded-3 shadow-sm p-2 d-inline-flex">
            <img src={logoStatsHub} alt="StatsHub Deportivo" style={{ maxHeight: '72px', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="position-relative py-lg-4">
          <p className="small fw-semibold text-uppercase mb-3" style={{ color: AMBER, letterSpacing: '0.18em' }}>
            Gestión y analítica deportiva
          </p>
          <h1
            className="font-display fw-bold mb-3"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 0.95 }}
          >
            Cada jugada,
            <br />
            <span style={{ color: AMBER }}>al instante.</span>
          </h1>
          <p className="text-white-50 fs-5 mb-0" style={{ maxWidth: '480px' }}>
            Administra torneos, registra actas en vivo y sigue las posiciones desde cualquier dispositivo.
          </p>
        </div>

        <ul className="position-relative list-unstyled row g-3 mb-0 d-none d-lg-flex">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="col-4">
              <Icon size={20} style={{ color: AMBER }} aria-hidden="true" />
              <p className="fw-semibold small mb-1 mt-2">{title}</p>
              <p className="text-white-50 small mb-0">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Formulario */}
      <section className="d-flex flex-column justify-content-center bg-white p-4 p-lg-5" style={{ flex: '1 1 45%' }}>
        <div className="w-100 mx-auto" style={{ maxWidth: '440px' }}>
          <p className="small fw-semibold text-uppercase text-muted mb-2" style={{ letterSpacing: '0.12em' }}>
            Bienvenido
          </p>
          <h2 className="h2 fw-bold mb-2" style={{ color: BRAND }}>
            Inicia sesión
          </h2>
          <p className="text-muted mb-4">Entra con tu cuenta para registrar actas y gestionar torneos.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label fw-semibold text-dark">
                Correo
              </label>
              <div className="input-group input-group-lg login-field">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={18} aria-hidden="true" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="nombre@correo.cl"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="login-password" className="form-label fw-semibold text-dark">
                Contraseña
              </label>
              <div className="input-group input-group-lg login-field">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={18} aria-hidden="true" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn bg-white border-start-0 text-muted"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div role="alert" aria-live="polite">
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn btn-lg text-white fw-bold w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
              style={{ backgroundColor: BRAND }}
            >
              {cargando ? 'Ingresando...' : 'Iniciar sesión'} 
              {!cargando && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <div className="d-flex align-items-center gap-3 my-4 text-muted small">
            <hr className="flex-grow-1 m-0" />
            <span>o</span>
            <hr className="flex-grow-1 m-0" />
          </div>

          <button type="button" className="btn btn-lg btn-outline-dark w-100" onClick={handleGuest}>
            Entrar como invitado
          </button>
          <p className="text-muted small text-center mt-2 mb-0">
            Como invitado puedes ver marcadores, torneos y posiciones.
          </p>
        </div>
      </section>
    </div>
  );
}