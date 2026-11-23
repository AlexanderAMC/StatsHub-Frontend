import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContext';
import { GUEST_USER, PERMISSIONS, ROLES, ROLE_PERMISSIONS } from '../data/users';
import { authService } from '../services/auth.service';
import { fetchApi, onUnauthorized } from '../services/api';
import { getTokenExpiry, isTokenExpired } from '../utils/jwt';

const SESSION_KEY = 'statshub_session';
const TOKEN_KEY = 'statshub_token';
const SESSION_EXPIRED_NOTICE = 'Tu sesión expiró. Inicia sesión nuevamente.';

function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (error) { console.error(error); }
}

// Restaura la sesión guardada solo si sigue siendo válida: el invitado no tiene token,
// pero una cuenta real sin token o con el token vencido se descarta.
function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user?.role === ROLES.GUEST) return user;

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token || isTokenExpired(token)) {
      clearStoredSession();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function writeSession(user, token) {
  try {
    if (!user) {
      clearStoredSession();
      return;
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch (error) { console.error(error); }
}

const mapAccounts = (rows) => rows.map((u) => ({
  id: u.id,
  name: `${u.nombre} ${u.apellido}`,
  firstName: u.nombre,
  lastName: u.apellido,
  email: u.correo,
  role: u.rol.toLowerCase(),
  status: u.activo ? 'activo' : 'bloqueado',
}));

// Campos del perfil (/auth/me) que se guardan en la sesión.
const profileFields = (profile) =>
  profile
    ? {
        teamId: profile.equipo_id ?? null,
        privacyAcceptedAt: profile.acepta_privacidad_en ?? null,
        receivesNotifications: profile.recibe_notificaciones ?? true,
        phone: profile.telefono ?? '',
      }
    : {};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [accounts, setAccounts] = useState([]);
  // Mensaje para la pantalla de login (p. ej. sesión expirada).
  const [sessionNotice, setSessionNotice] = useState('');

  const startSession = (nextUser, token) => {
    setUser(nextUser);
    writeSession(nextUser, token);
  };

  const clearSession = useCallback(() => {
    setAccounts([]);
    setUser(null);
    writeSession(null);
  }, []);

  // RF-02: el backend invalida el token (y todos los anteriores) antes de borrar la sesión local.
  const logout = useCallback(async () => {
    if (window.localStorage.getItem(TOKEN_KEY)) {
      await authService.logout().catch(() => {});
    }
    clearSession();
  }, [clearSession]);

  const expireSession = useCallback(() => {
    clearSession();
    setSessionNotice(SESSION_EXPIRED_NOTICE);
  }, [clearSession]);

  // El servidor rechazó el token (401): cerrar la sesión en vez de seguir mostrando errores.
  useEffect(() => onUnauthorized(expireSession), [expireSession]);

  // Cerrar la sesión justo cuando vence el token, aunque el usuario no haga ninguna petición.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return undefined;
    const token = window.localStorage.getItem(TOKEN_KEY);
    const expiry = token ? getTokenExpiry(token) : null;
    if (!expiry) return undefined;
    // setTimeout acepta como máximo ~24,8 días; los tokens duran 8 h.
    const timer = setTimeout(expireSession, Math.max(0, Math.min(expiry - Date.now(), 2 ** 31 - 1)));
    return () => clearTimeout(timer);
  }, [userId, expireSession]);

  // La lista de usuarios solo la puede pedir un administrador (el backend responde 401/403 al resto).
  const canManageUsers = Boolean(user) && (ROLE_PERMISSIONS[user.role] || []).includes(PERMISSIONS.MANAGE_USERS);

  const reloadAccounts = useCallback(async () => {
    try {
      setAccounts(mapAccounts(await fetchApi('/auth/users')));
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }, []);

  useEffect(() => {
    if (!canManageUsers) return undefined;
    let cancelled = false;
    fetchApi('/auth/users')
      .then((data) => { if (!cancelled) setAccounts(mapAccounts(data)); })
      .catch((error) => console.error('Error cargando usuarios:', error));
    return () => { cancelled = true; };
  }, [userId, canManageUsers]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);

      const loggedUser = {
        id: data.usuario.id,
        name: `${data.usuario.nombre} ${data.usuario.apellido}`,
        email: data.usuario.correo,
        role: data.usuario.rol.toLowerCase(),
        initials: `${data.usuario.nombre[0]}${data.usuario.apellido[0]}`.toUpperCase(),
        status: 'activo',
        teamId: null,
      };

      writeSession(loggedUser, data.token);
      // Perfil completo: equipo que entrena (permiso sobre su plantel), consentimiento y notificaciones.
      const profile = await authService.me().catch(() => null);
      setSessionNotice('');
      startSession({ ...loggedUser, ...profileFields(profile) }, data.token);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  const register = async ({ name, email, password, acceptPrivacy }) => {
    try {
      const parts = name.trim().split(' ');
      const nombre = parts[0];
      const apellido = parts.slice(1).join(' ') || 'Sin apellido';

      await authService.register(nombre, apellido, email, password, acceptPrivacy === true);
    } catch (error) {
      return { ok: false, error: error.message };
    }

    const result = await login(email, password);
    if (!result.ok) {
      return { ok: false, error: 'La cuenta se creó, pero no se pudo iniciar sesión. Intenta entrar con tus datos.' };
    }
    return result;
  };

  const loginAsGuest = () => {
    setSessionNotice('');
    startSession(GUEST_USER, null);
  };

  const can = (permission) => {
    if (!user || user.role === ROLES.GUEST) return false;
    return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
  };

  const call = async (action) => {
    try {
      return { ok: true, data: await action() };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  // RF-03: el servidor responde lo mismo exista o no el correo.
  const recoverPassword = (email) => call(() => authService.forgotPassword(email));
  const resetPassword = (token, password) => call(() => authService.resetPassword(token, password));

  // Cambiar la contraseña cierra las demás sesiones; esta continúa con el token nuevo.
  const changePassword = async (current, next) => {
    const result = await call(() => authService.changePassword(current, next));
    if (result.ok) writeSession(user, result.data.token);
    return result;
  };

  const updateProfile = async (data) => {
    const result = await call(() => authService.updateMe(data));
    if (result.ok) {
      const next = { ...user, ...profileFields(result.data) };
      setUser(next);
      writeSession(next, window.localStorage.getItem(TOKEN_KEY));
    }
    return result;
  };

  // RF-04: el administrador crea cuentas con rol y edita sus datos.
  const createAccount = async (data) => {
    const result = await call(() => authService.createUser(data));
    if (result.ok) await reloadAccounts();
    return result;
  };
  const updateAccount = async (id, data) => {
    const result = await call(() => authService.updateUser(id, data));
    if (result.ok) await reloadAccounts();
    return result;
  };

  const setAccountStatus = async (id, status) => {
    try {
      await fetchApi(`/auth/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert(error.message || 'No se pudo cambiar el estado.');
    }
  };

  const setAccountRole = async (id, role) => {
    try {
      await fetchApi(`/auth/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, role } : a)));
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert(error.message || 'No se pudo cambiar el rol.');
    }
  };

  const removeAccount = async (id) => {
    try {
      await fetchApi(`/auth/users/${id}`, { method: 'DELETE' });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(error.message || 'No se pudo eliminar el usuario.');
    }
  };

  // Organizador/administrador: cualquier plantel. Entrenador: solo el equipo que tiene asignado.
  const canManagePlayers = (teamId) => {
    if (!can(PERMISSIONS.MANAGE_PLAYERS)) return false;
    return user.role !== ROLES.COACH || user.teamId === teamId;
  };

  const value = {
    user,
    isGuest: user?.role === ROLES.GUEST,
    accounts,
    sessionNotice,
    login, register, loginAsGuest, logout, recoverPassword, resetPassword, changePassword, updateProfile,
    createAccount, updateAccount,
    setAccountStatus, setAccountRole, removeAccount, can, canManagePlayers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
