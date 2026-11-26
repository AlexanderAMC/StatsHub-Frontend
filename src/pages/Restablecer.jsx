import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PASSWORD_HINT, passwordProblem } from '../utils/password';

const BRAND = '#1E0A3C';

// RF-03: crear una nueva contraseña desde el enlace enviado por correo (válido 30 minutos, un solo uso).
export default function Restablecer() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError('Las contraseñas no coinciden.');
    setError('');
    setStatus('loading');
    const result = await resetPassword(token, password);
    if (result.ok) setStatus('done');
    else {
      setStatus('idle');
      setError(result.error);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#F4F2F8' }}>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white w-100" style={{ maxWidth: '440px' }}>
        <div className="d-flex align-items-center gap-2 mb-3" style={{ color: BRAND }}>
          <KeyRound size={22} aria-hidden="true" />
          <h1 className="h4 fw-bold mb-0">Nueva contraseña</h1>
        </div>

        {!/^[0-9a-f]{64}$/.test(token) ? (
          <div className="alert alert-danger mb-0">
            El enlace no es válido. <Link to="/login">Solicita uno nuevo</Link> desde “¿Olvidaste tu contraseña?”.
          </div>
        ) : status === 'done' ? (
          <div role="status">
            <div className="alert alert-success">Tu contraseña fue actualizada. Por seguridad, se cerraron tus otras sesiones.</div>
            <Link to="/login" className="btn text-white fw-bold w-100" style={{ backgroundColor: BRAND }}>Iniciar sesión</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-muted small">{PASSWORD_HINT}</p>
            <label htmlFor="reset-password" className="form-label fw-semibold">Nueva contraseña</label>
            <div className="input-group mb-3">
              <input id="reset-password" type={show ? 'text' : 'password'} className="form-control" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <label htmlFor="reset-confirm" className="form-label fw-semibold">Confirmar contraseña</label>
            <input id="reset-confirm" type={show ? 'text' : 'password'} className="form-control mb-3" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <div role="alert">{error && <div className="alert alert-danger py-2 small">{error}</div>}</div>
            <button type="submit" className="btn text-white fw-bold w-100" style={{ backgroundColor: BRAND }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
