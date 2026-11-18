const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'statshub_token';
const UNAUTHORIZED_EVENT = 'statshub:no-autorizado';

// Error de la API con el código HTTP (0 = no se pudo contactar al servidor).
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Permite que AuthProvider cierre la sesión cuando el servidor rechaza el token (expirado o revocado).
export function onUnauthorized(handler) {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.', 0);
  }

  // 204 No Content (y cuerpos vacíos en general) no traen JSON.
  const text = response.status === 204 ? '' : await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Un 401 con token significa sesión vencida o revocada. El 401 del propio login
    // (credenciales incorrectas) no debe cerrar ninguna sesión.
    if (response.status === 401 && token && endpoint !== '/auth/login') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(data?.error || 'Error en la petición', response.status, data);
  }

  return data;
};
