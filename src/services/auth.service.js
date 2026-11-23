import { fetchApi } from './api';

const json = (method, body) => ({ method, body: JSON.stringify(body ?? {}) });

export const authService = {
  login: (correo, password) => fetchApi('/auth/login', json('POST', { correo, password })),

  register: (nombre, apellido, correo, password, aceptaPrivacidad) =>
    fetchApi('/auth/register', json('POST', { nombre, apellido, correo, password, aceptaPrivacidad })),

  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  me: () => fetchApi('/auth/me'),
  updateMe: (data) => fetchApi('/auth/me', json('PUT', data)),
  changePassword: (actual, nueva) => fetchApi('/auth/me/password', json('PUT', { actual, nueva })),
  forgotPassword: (correo) => fetchApi('/auth/forgot-password', json('POST', { correo })),
  resetPassword: (token, password) => fetchApi('/auth/reset-password', json('POST', { token, password })),

  // Administración de usuarios
  createUser: (data) => fetchApi('/auth/users', json('POST', data)),
  updateUser: (id, data) => fetchApi(`/auth/users/${id}`, json('PUT', data)),
};
