import { fetchApi } from './api';

export const deportivosService = {
  getTorneos: () => fetchApi('/torneos'),
  getEquipos: () => fetchApi('/equipos'),
  getPartidos: () => fetchApi('/partidos'),
};