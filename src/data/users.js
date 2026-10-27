export const ROLES = {
  ADMIN: 'administrador',
  STATS: 'estadigrafo',
  GUEST: 'invitado',
};

export const ROLE_LABELS = {
  administrador: 'Administrador',
  estadigrafo: 'Estadígrafo',
  invitado: 'Invitado',
};

// Permisos que se consultan con can('...') en toda la app.
export const PERMISSIONS = {
  MANAGE_TOURNAMENTS: 'torneos:gestionar',
  RECORD_MATCHES: 'actas:registrar',
};

export const ROLE_PERMISSIONS = {
  administrador: [PERMISSIONS.MANAGE_TOURNAMENTS, PERMISSIONS.RECORD_MATCHES],
  estadigrafo: [PERMISSIONS.RECORD_MATCHES],
  invitado: [],
};

// Lo que se muestra en el perfil de cada rol.
export const ROLE_ABILITIES = {
  administrador: [
    'Ver marcadores, torneos y posiciones',
    'Registrar actas digitales en vivo',
    'Crear, editar y eliminar torneos',
  ],
  estadigrafo: [
    'Ver marcadores, torneos y posiciones',
    'Registrar actas digitales en vivo',
  ],
  invitado: ['Ver marcadores, torneos y posiciones'],
};

// Cuentas de demostración. Cuando exista el backend, el login se valida en el servidor
// (contraseñas con hash y token), y esta lista desaparece.
export const USERS = [
  { id: 'admin', name: 'Juan Villagran', initials: 'JV', email: 'admin@statshub.cl', password: 'admin123', role: ROLES.ADMIN },
  { id: 'estadigrafo', name: 'Estadígrafo de prueba', initials: 'EP', email: 'estadigrafo@statshub.cl', password: 'stats123', role: ROLES.STATS },
];

export const GUEST_USER = { id: 'invitado', name: 'Invitado', initials: 'IN', email: '', role: ROLES.GUEST };

// Nunca se guarda la contraseña en el estado de la app.
export const publicUser = ({ id, name, initials, email, role }) => ({ id, name, initials, email, role });

export function findUserById(id) {
  if (id === GUEST_USER.id) return GUEST_USER;
  const account = USERS.find((u) => u.id === id);
  return account ? publicUser(account) : null;
}
