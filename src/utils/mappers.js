import { MATCH_STATUS } from '../data/constants';
import { API_ORIGIN } from '../services/api';

// Traducen las filas de la API (español, snake_case) al formato que usa la interfaz, y al revés.
// Estados de la BD (CHECK en StatsHub-Database/migrations) → etiquetas de la UI.
const TOURNAMENT_STATUS_MAP = {
  PLANIFICADO: 'Planificado',
  INSCRIPCIONES: 'Inscripciones',
  ACTIVO: 'En Curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};
const TOURNAMENT_STATUS_TO_API = Object.fromEntries(Object.entries(TOURNAMENT_STATUS_MAP).map(([k, v]) => [v, k]));

const MATCH_STATUS_MAP = {
  PROGRAMADO: MATCH_STATUS.SCHEDULED,
  EN_CURSO: MATCH_STATUS.LIVE,
  FINALIZADO: MATCH_STATUS.FINISHED,
  SUSPENDIDO: MATCH_STATUS.SUSPENDED,
};

const EVENT_TYPE_MAP = { GOL: 'gol', AMARILLA: 'amarilla', ROJA: 'roja', SUSTITUCION: 'sustitucion', LESION: 'lesion' };
const EVENT_TYPE_TO_API = Object.fromEntries(Object.entries(EVENT_TYPE_MAP).map(([k, v]) => [v, k]));

// La BD guarda posiciones como texto libre (antes en mayúsculas): se muestran con formato de título.
const titleCase = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '');
const absoluteUrl = (url) => (url && url.startsWith('/') ? `${API_ORIGIN}${url}` : url || null);

export const mapTournament = (t) => ({
  id: t.id,
  name: t.nombre,
  category: t.categoria,
  categoryId: t.categoria_id,
  status: TOURNAMENT_STATUS_MAP[t.estado] ?? t.estado,
  teams: t.cupos ?? t.cantidad_equipos ?? 0,
  registeredTeams: t.cantidad_equipos ?? 0,
  format: t.formato ?? 'LIGA',
  fee: t.costo_inscripcion ?? null,
  startDate: t.fecha_inicio,
  endDate: t.fecha_fin,
  season: t.fecha_inicio?.slice(0, 4) || '2026',
});

export const tournamentToApi = (d) => ({
  nombre: d.name,
  categoria: d.category,
  cupos: Number(d.teams),
  estado: TOURNAMENT_STATUS_TO_API[d.status] ?? 'PLANIFICADO',
  fecha_inicio: d.startDate,
  fecha_fin: d.endDate || null,
  formato: d.format ?? 'LIGA',
  costo_inscripcion: d.fee === '' || d.fee === undefined ? null : d.fee,
});

export const mapTeam = (e) => ({
  id: e.id,
  name: e.nombre,
  tournamentId: e.torneo_id ?? null,
  tournamentIds: e.torneo_ids ?? [],
  coach: e.entrenador || 'Sin asignar',
  coachUserId: e.entrenador_id ?? null,
  logo: absoluteUrl(e.escudo_url),
  registration: e.estado_inscripcion ?? null,
});

export const teamToApi = (d) => ({ nombre: d.name, torneo_id: d.tournamentId, entrenador: d.coach || null });

export const mapMatch = (p) => ({
  id: p.id,
  homeId: p.equipo_local,
  awayId: p.equipo_visita,
  scoreHome: p.goles_local ?? 0,
  scoreAway: p.goles_visita ?? 0,
  status: MATCH_STATUS_MAP[p.estado] ?? MATCH_STATUS.SCHEDULED,
  date: p.fecha_partido?.split(/[ T]/)[0] || '',
  time: p.fecha_partido?.split(/[ T]/)[1]?.slice(0, 5) || '',
  venue: p.cancha || 'Cancha 1',
  tournamentId: p.torneo_id,
  refereeId: p.arbitro_id ?? null,
  statsKeeperId: p.estadigrafo_id ?? null,
  round: p.jornada ?? 1,
  minute: p.minuto ?? 0,
  lineup: p.alineacion ?? null,
  closedAt: p.acta_cerrada_en ?? null,
});

export const matchToApi = (d) => ({
  torneo_id: d.tournamentId,
  jornada: d.round,
  equipo_local: d.homeId,
  equipo_visita: d.awayId,
  fecha: d.date,
  hora: d.time,
  cancha: d.venue,
  arbitro_id: d.refereeId || null,
  estadigrafo_id: d.statsKeeperId || null,
});

export const mapPlayer = (j) => ({
  id: j.id,
  name: j.nombre,
  number: j.numero ?? null,
  position: titleCase(j.posicion),
  teamId: j.equipo_id ?? null,
  birthDate: j.fecha_nacimiento ?? '',
  rut: j.rut ?? '',
});

export const playerToApi = (d) => ({
  nombre: d.name,
  numero: d.number,
  posicion: d.position,
  fecha_nacimiento: d.birthDate || null,
  rut: d.rut || null,
  ...(d.teamId !== undefined && { equipo_id: d.teamId }),
});

export const mapEvent = (e) => ({
  id: e.id,
  matchId: e.partido_id,
  minute: e.minuto,
  type: EVENT_TYPE_MAP[e.tipo_evento] ?? e.tipo_evento?.toLowerCase(),
  side: e.lado === 'VISITA' ? 'away' : 'home',
  playerId: e.jugador_id,
  assistId: e.asistencia_jugador_id ?? null,
  relatedId: e.relacionado_jugador_id ?? null,
  automatic: e.descripcion === 'DOBLE_AMARILLA',
});

export const eventToApi = (d) => ({
  tipo: EVENT_TYPE_TO_API[d.type],
  lado: d.side === 'away' ? 'VISITA' : 'LOCAL',
  jugador_id: d.playerId,
  asistencia_id: d.assistId ?? null,
  relacionado_id: d.relatedId ?? null,
});

export const mapTransfer = (t) => ({
  id: t.id,
  playerId: t.jugador_id,
  fromTeamId: t.desde_equipo_id ?? null,
  toTeamId: t.hacia_equipo_id ?? null,
  date: t.fecha,
});

export const mapNotification = (n) => ({
  id: n.id,
  kind: n.tipo,
  text: `${n.titulo}: ${n.mensaje}`,
  read: Boolean(n.leida),
  at: n.fecha,
  matchId: n.partido_id ?? null,
});

export const mapCategory = (c) => ({ id: c.id, name: c.nombre, minAge: c.edad_min ?? null, maxAge: c.edad_max ?? null });

export const mapPrediction = (p) => ({
  matchId: p.partido_id,
  home: p.local,
  draw: p.empate,
  away: p.visita,
  expectedHome: p.goles_esperados_local,
  expectedAway: p.goles_esperados_visita,
  model: p.modelo,
});
