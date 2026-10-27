import { fetchApi } from './api';

export const authService = {
  login: (correo, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  }),
};