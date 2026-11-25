export const ROLES = {
  ADMIN: 'administrador',
  ORGANIZER: 'organizador',
  COACH: 'entrenador',
  REFEREE: 'arbitro',
  STATS: 'estadigrafo',
  PLAYER: 'jugador',
  SPECTATOR: 'espectador',
  GUEST: 'invitado',
};

export const ROLE_LABELS = {
  administrador: 'Administrador',
  organizador: 'Organizador',
  entrenador: 'Entrenador',
  arbitro: 'Árbitro',
  estadigrafo: 'Estadígrafo',
  jugador: 'Jugador',
  espectador: 'Espectador',
  invitado: 'Invitado',
};

// Roles que un administrador puede asignar (el invitado no es una cuenta).
export const ASSIGNABLE_ROLES = Object.values(ROLES).filter((r) => r !== ROLES.GUEST);

export const PERMISSIONS = {
  MANAGE_USERS: 'usuarios:gestionar',
  MANAGE_TOURNAMENTS: 'torneos:gestionar',
  MANAGE_TEAMS: 'equipos:gestionar',
  MANAGE_PLAYERS: 'jugadores:gestionar',
  SCHEDULE_MATCHES: 'partidos:programar',
  RECORD_MATCHES: 'actas:registrar',
  EXPORT: 'reportes:exportar',
  STATS_ADVANCED: 'estadisticas:avanzadas',
  ANALYTICS: 'analitica:predictiva',
  OWN_TEAM: 'equipo:propio',
  COLLECT: 'cobros:gestionar',
  PAY_OFFICIALS: 'oficiales:liquidar',
};

const P = PERMISSIONS;

// Permisos por ROL. Los planes de pago (Básico/Pro/Ultra) suman permisos: el servidor entrega los
// permisos efectivos en /auth/me y AuthProvider los usa. Esta tabla es el respaldo sin conexión.
export const ROLE_PERMISSIONS = {
  administrador: Object.values(PERMISSIONS),
  organizador: [P.MANAGE_TOURNAMENTS, P.MANAGE_TEAMS, P.MANAGE_PLAYERS, P.SCHEDULE_MATCHES, P.RECORD_MATCHES, P.EXPORT,
    P.STATS_ADVANCED, P.ANALYTICS, P.COLLECT, P.PAY_OFFICIALS],
  entrenador: [P.MANAGE_PLAYERS, P.EXPORT, P.STATS_ADVANCED, P.ANALYTICS, P.OWN_TEAM],
  arbitro: [P.RECORD_MATCHES, P.STATS_ADVANCED],
  estadigrafo: [P.RECORD_MATCHES, P.STATS_ADVANCED],
  jugador: [],
  espectador: [],
  invitado: [],
};

export const PLAN_LABELS = { BASICO: 'Plan Básico', PRO: 'Plan Pro', ULTRA: 'Plan Ultra' };

// Administración y organización de la liga (rol): alcance sobre todos los torneos.
export const isLeagueManagerRole = (role) => role === ROLES.ADMIN || role === ROLES.ORGANIZER;

const VIEW = 'Ver marcadores, calendario, posiciones y estadísticas';

export const ROLE_ABILITIES = {
  administrador: [VIEW, 'Gestionar usuarios y roles', 'Crear y administrar torneos, equipos y jugadores', 'Programar partidos y registrar actas', 'Exportar reportes'],
  organizador: [VIEW, 'Crear y administrar torneos, equipos y jugadores', 'Programar partidos y asignar árbitros', 'Registrar actas', 'Exportar reportes'],
  entrenador: [VIEW, 'Administrar el plantel de su equipo', 'Exportar reportes'],
  arbitro: [VIEW, 'Registrar actas de los partidos', 'Exportar reportes'],
  estadigrafo: [VIEW, 'Registrar actas de los partidos', 'Exportar reportes'],
  jugador: [VIEW, 'Exportar reportes'],
  espectador: [VIEW, 'Exportar reportes'],
  invitado: [VIEW],
};

// El login se valida en el servidor (contraseñas con hash y token JWT): no hay cuentas en el cliente.
export const GUEST_USER = { id: 'invitado', name: 'Invitado', initials: 'IN', email: '', role: ROLES.GUEST, status: 'activo', teamId: null };

// Nunca se guarda la contraseña en el estado de la sesión.
export const publicUser = ({ id, name, initials, email, role, status, teamId }) => ({ id, name, initials, email, role, status, teamId });

export function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}
