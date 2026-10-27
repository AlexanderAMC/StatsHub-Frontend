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
};

const P = PERMISSIONS;

export const ROLE_PERMISSIONS = {
  administrador: Object.values(PERMISSIONS),
  organizador: [P.MANAGE_TOURNAMENTS, P.MANAGE_TEAMS, P.MANAGE_PLAYERS, P.SCHEDULE_MATCHES, P.RECORD_MATCHES, P.EXPORT],
  entrenador: [P.MANAGE_PLAYERS, P.EXPORT],
  arbitro: [P.RECORD_MATCHES, P.EXPORT],
  estadigrafo: [P.RECORD_MATCHES, P.EXPORT],
  jugador: [P.EXPORT],
  espectador: [P.EXPORT],
  invitado: [],
};

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

// Cuentas de demostración. Cuando exista el backend, el login se valida en el servidor
// (contraseñas con hash y token JWT) y esta lista desaparece.
export const USERS = [
  { id: 'admin', name: 'Juan Villagran', initials: 'JV', email: 'admin@statshub.cl', password: 'admin123', role: ROLES.ADMIN, status: 'activo', teamId: null },
  { id: 'organizador', name: 'Organizador de prueba', initials: 'OP', email: 'organizador@statshub.cl', password: 'organizador123', role: ROLES.ORGANIZER, status: 'activo', teamId: null },
  { id: 'entrenador', name: 'Entrenador de prueba', initials: 'EP', email: 'entrenador@statshub.cl', password: 'entrenador123', role: ROLES.COACH, status: 'activo', teamId: 1 },
  { id: 'arbitro', name: 'Árbitro de prueba', initials: 'AP', email: 'arbitro@statshub.cl', password: 'arbitro123', role: ROLES.REFEREE, status: 'activo', teamId: null },
  { id: 'estadigrafo', name: 'Estadígrafo de prueba', initials: 'ES', email: 'estadigrafo@statshub.cl', password: 'stats123', role: ROLES.STATS, status: 'activo', teamId: null },
  { id: 'jugador', name: 'Jugador de prueba', initials: 'JP', email: 'jugador@statshub.cl', password: 'jugador123', role: ROLES.PLAYER, status: 'activo', teamId: null },
  { id: 'espectador', name: 'Espectador de prueba', initials: 'EP', email: 'espectador@statshub.cl', password: 'espectador123', role: ROLES.SPECTATOR, status: 'activo', teamId: null },
];

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
