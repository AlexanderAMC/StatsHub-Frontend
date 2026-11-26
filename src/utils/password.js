// Mismas reglas básicas que valida el backend (el servidor además rechaza contraseñas comunes
// o que contengan el correo).
export const PASSWORD_HINT = 'Al menos 8 caracteres, con letras y números, que no uses en otros sitios.';

export function passwordProblem(password) {
  if (!password || password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'La contraseña debe combinar letras y números.';
  return null;
}
