import { useRef, useState } from 'react';
import { INITIAL_TOURNAMENTS } from '../data/mockData';

export function useTournaments() {
  const [tournaments, setTournaments] = useState(INITIAL_TOURNAMENTS);
  const nextId = useRef(Math.max(...INITIAL_TOURNAMENTS.map((t) => t.id)) + 1);

  const normalize = (data) => ({ ...data, teams: Number(data.teams) });

  const addTournament = (data) => {
    const id = nextId.current++;
    setTournaments((prev) => [...prev, { id, ...normalize(data) }]);
  };

  const updateTournament = (id, data) => {
    setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...normalize(data) } : t)));
  };

  const removeTournament = (id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  return { tournaments, addTournament, updateTournament, removeTournament };
}
