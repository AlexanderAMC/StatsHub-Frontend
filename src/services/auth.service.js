import { fetchApi } from './api';

export const authService = {
  login: (correo, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  }),
  
  register: (nombre, apellido, correo, password) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nombre, apellido, correo, password }),
  }),
};