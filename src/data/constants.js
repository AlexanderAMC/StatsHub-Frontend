export const MATCH_STATUS = {
  SCHEDULED: 'Programado',
  LIVE: 'En Vivo',
  FINISHED: 'Finalizado',
  SUSPENDED: 'Suspendido',
};

export const MATCH_BADGE = {
  Programado: 'bg-secondary',
  'En Vivo': 'bg-danger',
  Finalizado: 'bg-dark',
  Suspendido: 'bg-warning text-dark',
};

export const MAX_MINUTE = 130;

export const TOURNAMENT_STATUSES = ['Planificado', 'Inscripciones', 'En Curso', 'Finalizado'];

export const STATUS_BADGE = {
  'En Curso': 'bg-success',
  Inscripciones: 'bg-primary',
  Planificado: 'bg-warning text-dark',
  Finalizado: 'bg-secondary',
};

export const POSITIONS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

export const EVENT_TYPES = {
  gol: { label: 'Gol', badge: 'bg-success' },
  amarilla: { label: 'Tarjeta amarilla', badge: 'bg-warning text-dark' },
  roja: { label: 'Tarjeta roja', badge: 'bg-danger' },
  sustitucion: { label: 'Sustitución', badge: 'bg-primary' },
  lesion: { label: 'Lesión', badge: 'bg-secondary' },
};
