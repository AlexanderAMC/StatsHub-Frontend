// Estados de pago (pagos.transacciones) y formato de pesos chilenos.
export const PAYMENT_BADGE = {
  PAGADO: 'bg-success',
  PENDIENTE: 'bg-warning text-dark',
  RECHAZADO: 'bg-danger',
  ANULADO: 'bg-secondary',
};

export const formatCLP = (value) => `$${Number(value ?? 0).toLocaleString('es-CL')}`;
