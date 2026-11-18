import { describe, expect, it } from 'vitest';
import { mapMatch, mapTeam, mapTournament } from './mappers';
import { MATCH_STATUS } from '../data/constants';

describe('mappers de la API', () => {
  it('mapMatch usa los ids reales de equipos y torneo', () => {
    const match = mapMatch({
      id: 7, torneo_id: 2, equipo_local: 3, equipo_visita: 4, estado: 'FINALIZADO',
      goles_local: 2, goles_visita: 1, fecha_partido: '2027-03-10T18:30:00.000Z', cancha: 'Estadio Sur',
    });
    expect(match).toMatchObject({
      id: 7, tournamentId: 2, homeId: 3, awayId: 4, scoreHome: 2, scoreAway: 1,
      status: MATCH_STATUS.FINISHED, date: '2027-03-10', time: '18:30', venue: 'Estadio Sur',
    });
  });

  it('mapMatch traduce todos los estados de la BD, incluido SUSPENDIDO', () => {
    expect(mapMatch({ estado: 'PROGRAMADO' }).status).toBe(MATCH_STATUS.SCHEDULED);
    expect(mapMatch({ estado: 'EN_CURSO' }).status).toBe(MATCH_STATUS.LIVE);
    expect(mapMatch({ estado: 'SUSPENDIDO' }).status).toBe(MATCH_STATUS.SUSPENDED);
  });

  it('mapTournament incluye la cantidad de equipos y el estado legible', () => {
    expect(mapTournament({ id: 1, nombre: 'Apertura', estado: 'ACTIVO', cantidad_equipos: 6, fecha_inicio: '2027-03-01' }))
      .toMatchObject({ name: 'Apertura', status: 'En Curso', teams: 6, season: '2027' });
  });

  it('mapTeam toma el torneo del backend en vez de un valor fijo', () => {
    expect(mapTeam({ id: 3, nombre: 'Halcones', torneo_id: 5, torneo_ids: [5, 2] }))
      .toMatchObject({ tournamentId: 5, tournamentIds: [5, 2] });
    expect(mapTeam({ id: 4, nombre: 'Sin torneo' }).tournamentId).toBeNull();
  });
});
