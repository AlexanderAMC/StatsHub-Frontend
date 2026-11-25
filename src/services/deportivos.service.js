import { fetchApi } from './api';

const json = (method, body) => ({ method, body: JSON.stringify(body ?? {}) });

export const deportivosService = {
  // Portal público
  getLiga: () => fetchApi('/liga'),
  getCategorias: () => fetchApi('/categorias'),
  getTorneos: () => fetchApi('/torneos'),
  getEquipos: () => fetchApi('/equipos'),
  getJugadores: () => fetchApi('/jugadores'),
  getTransferencias: () => fetchApi('/transferencias'),
  getPartidos: () => fetchApi('/partidos'),
  getEventos: () => fetchApi('/eventos'),
  getPredicciones: () => fetchApi('/estadisticas/predicciones'),
  getFairPlay: (torneoId) => fetchApi(`/estadisticas/fair-play${torneoId ? `?torneo_id=${torneoId}` : ''}`),

  // Con sesión
  getOficiales: () => fetchApi('/oficiales'),
  getNotificaciones: () => fetchApi('/notificaciones'),
  marcarNotificacionesLeidas: () => fetchApi('/notificaciones/leidas', { method: 'POST' }),

  updateLiga: (data) => fetchApi('/liga', json('PUT', data)),
  createCategoria: (data) => fetchApi('/categorias', json('POST', data)),
  deleteCategoria: (id) => fetchApi(`/categorias/${id}`, { method: 'DELETE' }),
  createTorneo: (data) => fetchApi('/torneos', json('POST', data)),
  updateTorneo: (id, data) => fetchApi(`/torneos/${id}`, json('PUT', data)),
  deleteTorneo: (id) => fetchApi(`/torneos/${id}`, { method: 'DELETE' }),

  createEquipo: (data) => fetchApi('/equipos', json('POST', data)),
  updateEquipo: (id, data) => fetchApi(`/equipos/${id}`, json('PUT', data)),
  deleteEquipo: (id) => fetchApi(`/equipos/${id}`, { method: 'DELETE' }),
  uploadEscudo: (id, file) => {
    const form = new FormData();
    form.append('escudo', file);
    return fetchApi(`/equipos/${id}/escudo`, { method: 'POST', body: form });
  },

  createJugador: (data) => fetchApi('/jugadores', json('POST', data)),
  updateJugador: (id, data) => fetchApi(`/jugadores/${id}`, json('PUT', data)),
  deleteJugador: (id) => fetchApi(`/jugadores/${id}`, { method: 'DELETE' }),
  transferirJugador: (id, equipoId) => fetchApi(`/jugadores/${id}/transferencia`, json('POST', { equipo_id: equipoId })),

  createPartido: (data) => fetchApi('/partidos', json('POST', data)),
  createPartidosLote: (partidos) => fetchApi('/partidos/lote', json('POST', { partidos })),
  updatePartido: (id, data) => fetchApi(`/partidos/${id}`, json('PUT', data)),
  suspenderPartido: (id) => fetchApi(`/partidos/${id}/suspender`, { method: 'POST' }),
  recordatorioPartido: (id) => fetchApi(`/partidos/${id}/recordatorio`, { method: 'POST' }),

  iniciarPartido: (id, alineacion) => fetchApi(`/partidos/${id}/iniciar`, json('POST', { alineacion })),
  setMinuto: (id, minuto) => fetchApi(`/partidos/${id}/minuto`, json('PUT', { minuto })),
  addEvento: (id, data) => fetchApi(`/partidos/${id}/eventos`, json('POST', data)),
  deshacerEvento: (id) => fetchApi(`/partidos/${id}/eventos/ultimo`, { method: 'DELETE' }),
  finalizarPartido: (id) => fetchApi(`/partidos/${id}/finalizar`, { method: 'POST' }),

  crearCobro: (equipoId, torneoId) => fetchApi('/pagos/inscripcion', json('POST', { equipo_id: equipoId, torneo_id: torneoId })),
  getPagos: () => fetchApi('/pagos'),
  getPago: (id) => fetchApi(`/pagos/${encodeURIComponent(id)}`),
  // Planes y suscripciones
  getPlanes: () => fetchApi('/planes'),
  getMiSuscripcion: () => fetchApi('/suscripciones/mia'),
  comprarPlan: (plan, periodo) => fetchApi('/suscripciones', json('POST', { plan, periodo })),
  updatePlan: (codigo, data) => fetchApi(`/planes/${codigo}`, json('PUT', data)),
  getResumenSuscripciones: () => fetchApi('/suscripciones'),

  // Cobros a equipos
  getCobros: () => fetchApi('/cobros'),
  createCobro: (data) => fetchApi('/cobros', json('POST', data)),
  createPlanillas: (partidoId, monto) => fetchApi('/cobros/planillas', json('POST', { partido_id: partidoId, monto })),
  pagarCobro: (id) => fetchApi(`/cobros/${id}/pagar`, { method: 'POST' }),
  anularCobro: (id) => fetchApi(`/cobros/${id}/anular`, { method: 'POST' }),

  // Oficiales de partido
  setTarifaOficial: (torneoId, usuarioId, tarifa) => fetchApi(`/torneos/${torneoId}/oficiales/${usuarioId}`, json('PUT', { tarifa })),
  getPendientesOficial: (oficialId, torneoId) =>
    fetchApi(`/liquidaciones/pendientes?oficial_id=${oficialId}${torneoId ? `&torneo_id=${torneoId}` : ''}`),
  getMisPendientes: () => fetchApi('/liquidaciones/mis-pendientes'),
  getLiquidaciones: () => fetchApi('/liquidaciones'),
  crearLiquidacion: (oficialId, torneoId) => fetchApi('/liquidaciones', json('POST', { oficial_id: oficialId, torneo_id: torneoId || null })),
  pagarLiquidacion: (id, data) => fetchApi(`/liquidaciones/${id}/pagar`, json('POST', data)),
  confirmarLiquidacion: (id, conforme, observacion) => fetchApi(`/liquidaciones/${id}/confirmar`, json('POST', { conforme, observacion })),
  anularLiquidacion: (id) => fetchApi(`/liquidaciones/${id}/anular`, { method: 'POST' }),
  enviarInforme: (partidoId, informe) => fetchApi(`/partidos/${partidoId}/informe`, json('POST', { informe })),

  getAuditoria: ({ pagina = 1, limite = 50, accion = '' } = {}) =>
    fetchApi(`/auditoria?pagina=${pagina}&limite=${limite}${accion ? `&accion=${encodeURIComponent(accion)}` : ''}`),
};
