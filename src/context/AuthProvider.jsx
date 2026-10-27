import { useState } from 'react';
import { AuthContext } from './authContext';
import { GUEST_USER, ROLES, ROLE_PERMISSIONS } from '../data/users';
import { authService } from '../services/auth.service';

const SESSION_KEY = 'statshub_session';
const TOKEN_KEY = 'statshub_token';

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeSession(user, token) {
  try {
    if (user && token) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) { console.error(error); }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const startSession = (nextUser, token) => {
    setUser(nextUser);
    writeSession(nextUser, token);
  };

  // 1. LOGIN REAL
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      const loggedUser = {
        id: data.usuario.id,
        name: `${data.usuario.nombre} ${data.usuario.apellido}`,
        email: data.usuario.correo,
        role: data.usuario.rol.toLowerCase(), // Ej: 'administrador'
        initials: `${data.usuario.nombre[0]}${data.usuario.apellido[0]}`.toUpperCase(),
        status: 'activo',
        teamId: null
      };
      
      startSession(loggedUser, data.token);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  // 2. REGISTRO REAL
  const register = async ({ name, email, password }) => {
    try {
      // Separamos el nombre completo en nombre y apellido
      const parts = name.trim().split(' ');
      const nombre = parts[0];
      const apellido = parts.slice(1).join(' ') || 'Sin apellido';

      // Llamamos al backend
      await authService.register(nombre, apellido, email, password);

      // Si el registro es exitoso, hacemos login automático
      return await login(email, password);
    } catch (error) {
      return { ok: false, error: error.message };
    }
  };

  const loginAsGuest = () => startSession(GUEST_USER, null);
  const logout = () => startSession(null, null);

  const can = (permission) => {
    if (!user || user.role === ROLES.GUEST) return false;
    return (ROLE_PERMISSIONS[user.role] || []).includes(permission);
  };

  // Funciones pendientes (no críticas para el registro/login)
  const recoverPassword = () => ({ ok: false, error: 'Recuperación no disponible aún.' });
  const setAccountStatus = () => {};
  const setAccountRole = () => {};
  const removeAccount = () => {};
  const canManagePlayers = () => false;

  const value = {
    user,
    isGuest: user?.role === ROLES.GUEST,
    accounts: [], 
    login, register, loginAsGuest, logout, recoverPassword,
    setAccountStatus, setAccountRole, removeAccount, can, canManagePlayers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}