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

// Deportes: el torneo define cuál se juega. Básquetbol es el principal.
export const SPORTS = { BASKETBALL: 'BASQUETBOL', FOOTBALL: 'FUTBOL' };
export const SPORT_LABELS = { BASQUETBOL: 'Básquetbol', FUTBOL: 'Fútbol' };
export const isBasketball = (sport) => sport === SPORTS.BASKETBALL;

// Reglas de básquetbol (iguales a las que valida el backend).
export const BASKETBALL = {
  periods: 4,
  periodMinutes: 10,
  overtimeMinutes: 5,
  foulOut: 5,
  techOut: 2,
  teamFoulBonus: 5, // desde la 5.ª falta de equipo en el cuarto, tiros libres
};
export const periodLabel = (p) => (p > BASKETBALL.periods ? `Prórroga ${p - BASKETBALL.periods}` : `${p}.º cuarto`);

export const TOURNAMENT_STATUSES = ['Planificado', 'Inscripciones', 'En Curso', 'Finalizado', 'Cancelado'];

export const STATUS_BADGE = {
  'En Curso': 'bg-success',
  Inscripciones: 'bg-primary',
  Planificado: 'bg-warning text-dark',
  Finalizado: 'bg-secondary',
  Cancelado: 'bg-danger',
};

export const MAX_SUBSTITUTIONS = 5;

export const POSITIONS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
export const BASKETBALL_POSITIONS = ['Base', 'Escolta', 'Alero', 'Ala-pívot', 'Pívot'];
export const positionsFor = (sport) => (isBasketball(sport) ? BASKETBALL_POSITIONS : POSITIONS);

export const EVENT_TYPES = {
  gol: { label: 'Gol', badge: 'bg-success' },
  amarilla: { label: 'Tarjeta amarilla', badge: 'bg-warning text-dark' },
  roja: { label: 'Tarjeta roja', badge: 'bg-danger' },
  sustitucion: { label: 'Sustitución', badge: 'bg-primary' },
  lesion: { label: 'Lesión', badge: 'bg-secondary' },
  punto1: { label: 'Tiro libre (1 punto)', badge: 'bg-success', points: 1 },
  punto2: { label: 'Doble (2 puntos)', badge: 'bg-success', points: 2 },
  punto3: { label: 'Triple (3 puntos)', badge: 'bg-success', points: 3 },
  rebote: { label: 'Rebote', badge: 'bg-info text-dark' },
  falta: { label: 'Falta personal', badge: 'bg-warning text-dark', foul: true },
  tecnica: { label: 'Falta técnica', badge: 'bg-danger', foul: true },
  antideportiva: { label: 'Falta antideportiva', badge: 'bg-danger', foul: true },
  tiempo: { label: 'Tiempo muerto', badge: 'bg-dark' },
};
