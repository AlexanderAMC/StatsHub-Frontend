import { MATCH_STATUS } from '../data/constants';

// Traducen las filas de la API (español, snake_case) al formato que usa la interfaz.
// Estados de la BD (CHECK en StatsHub-Database/migrations) → etiquetas de la UI.
const TOURNAMENT_STATUS_MAP = {
  PLANIFICADO: 'Planificado',
  ACTIVO: 'En Curso',
  FINALIZADO: 'Finalizado',
};

const MATCH_STATUS_MAP = {
  PROGRAMADO: MATCH_STATUS.SCHEDULED,
  EN_CURSO: MATCH_STATUS.LIVE,
  FINALIZADO: MATCH_STATUS.FINISHED,
  SUSPENDIDO: MATCH_STATUS.SUSPENDED,
};

export const mapTournament = (t) => ({
  id: t.id,
  name: t.nombre,
  category: t.categoria,
  categoryId: t.categoria_id,
  status: TOURNAMENT_STATUS_MAP[t.estado] ?? t.estado,
  teams: t.cantidad_equipos ?? 0,
  startDate: t.fecha_inicio,
  endDate: t.fecha_fin,
  season: t.fecha_inicio?.slice(0, 4) || '2026',
});

export const mapTeam = (e) => ({
  id: e.id,
  name: e.nombre,
  tournamentId: e.torneo_id ?? null,
  tournamentIds: e.torneo_ids ?? [],
  coach: 'Sin asignar',
});

export const mapMatch = (p) => ({
  id: p.id,
  homeId: p.equipo_local,
  awayId: p.equipo_visita,
  scoreHome: p.goles_local ?? 0,
  scoreAway: p.goles_visita ?? 0,
  status: MATCH_STATUS_MAP[p.estado] ?? MATCH_STATUS.SCHEDULED,
  date: p.fecha_partido?.split('T')[0] || '',
  time: p.fecha_partido?.split('T')[1]?.slice(0, 5) || '',
  venue: p.cancha || 'Cancha 1',
  tournamentId: p.torneo_id,
  refereeId: null,
  round: 1,
  minute: 0,
});
