// Lee la fecha de expiración (exp) de un JWT. No valida la firma: eso lo hace el servidor.
// Solo sirve para no restaurar sesiones ya vencidas y cerrar la sesión a tiempo.
export function getTokenExpiry(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json);
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token, now = Date.now()) {
  const expiry = getTokenExpiry(token);
  return expiry === null || expiry <= now;
}
