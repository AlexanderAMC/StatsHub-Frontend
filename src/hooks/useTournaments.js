import { useState, useEffect } from 'react';
import { deportivosService } from '../services/deportivos.service';

export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await deportivosService.getTorneos();
        setTournaments(data.map(t => ({
          id: t.id,
          name: t.nombre,
          category: t.categoria,
          status: t.estado === 'ACTIVO' ? 'En Curso' : t.estado === 'PLANIFICADO' ? 'Planificado' : 'Finalizado',
          teams: 0, // Ojo: Lo adaptaremos luego
        })));
      } catch (error) { console.error(error); }
    };
    cargar();
  }, []);

  return { tournaments, addTournament: () => {}, updateTournament: () => {}, removeTournament: () => {} };
}