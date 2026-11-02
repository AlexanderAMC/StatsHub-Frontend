import { useState, useEffect } from 'react'; // <-- 1. Agregamos useEffect
import { AuthContext } from './authContext';
import { GUEST_USER, ROLES, ROLE_PERMISSIONS } from '../data/users';
import { authService } from '../services/auth.service';
import { fetchApi } from '../services/api'; // <-- 2. Importamos fetchApi

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
  
  // 3. NUEVO ESTADO para guardar los usuarios de la BD
  const [accounts, setAccounts] = useState([]); 

  // 4. NUEVO useEffect para buscar los usuarios al cargar la app
  useEffect(() => {
    const cargarUsuarios = async () => {
      // Solo intentamos cargar si hay un usuario logueado (para no dar error 401)
      if (!user) return; 
      
      try {
        const data = await fetchApi('/auth/users');
        
        const formattedAccounts = data.map((u) => ({
          id: u.id,
          name: `${u.nombre} ${u.apellido}`,
          email: u.correo,
          role: u.rol.toLowerCase(),
          status: u.activo ? 'activo' : 'bloqueado'
        }));
        
        setAccounts(formattedAccounts);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    cargarUsuarios();
  }, [user]); // Se ejecuta cuando el usuario inicia sesión

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
        role: data.usuario.rol.toLowerCase(), 
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
      const parts = name.trim().split(' ');
      const nombre = parts[0];
      const apellido = parts.slice(1).join(' ') || 'Sin apellido';

      await authService.register(nombre, apellido, email, password);
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

  const recoverPassword = () => ({ ok: false, error: 'Recuperación no disponible aún.' });
  
  // Estas funciones están vacías por ahora, pero al menos actualizan la pantalla:
  // Funciones REALES conectadas a la Base de Datos
  const setAccountStatus = async (id, status) => {
    try {
      await fetchApi(`/auth/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado en la base de datos.");
    }
  };

  const setAccountRole = async (id, role) => {
    try {
      await fetchApi(`/auth/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, role } : a));
    } catch (error) {
      console.error("Error al cambiar rol:", error);
      alert("No se pudo cambiar el rol en la base de datos.");
    }
  };

  const removeAccount = async (id) => {
    try {
      await fetchApi(`/auth/users/${id}`, { method: 'DELETE' });
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario de la base de datos.");
    }
  };
  
  const canManagePlayers = () => false;

  const value = {
    user,
    isGuest: user?.role === ROLES.GUEST,
    accounts, // <-- 5. Aquí pasamos los usuarios reales en lugar del array vacío []
    login, register, loginAsGuest, logout, recoverPassword,
    setAccountStatus, setAccountRole, removeAccount, can, canManagePlayers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}