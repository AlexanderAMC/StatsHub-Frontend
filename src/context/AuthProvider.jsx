import { useState } from 'react';
import { AuthContext } from './authContext';
import { GUEST_USER, ROLES, ROLE_PERMISSIONS } from '../data/users';
import { authService } from '../services/auth.service';

const STORAGE_KEY = 'statshub_session';
const TOKEN_KEY = 'statshub_token';

function readSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(user, token) {
  try {
    if (user && token) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) { console.error(error); }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const startSession = (nextUser, token) => {
    setUser(nextUser);
    saveSession(nextUser, token);
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      const loggedUser = {
        id: data.usuario.id,
        name: `${data.usuario.nombre} ${data.usuario.apellido}`,
        email: data.usuario.correo,
        role: data.usuario.rol.toLowerCase(), // Ej: 'administrador'
        initials: `${data.usuario.nombre[0]}${data.usuario.apellido[0]}`.toUpperCase()
      };
      startSession(loggedUser, data.token);
      return { ok: true };
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

  return (
    <AuthContext.Provider value={{ user, isGuest: user?.role === ROLES.GUEST, login, loginAsGuest, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}