// Escudo del equipo (WebP servido por el backend) o, si no tiene, sus iniciales.
export default function TeamLogo({ team, size = 48 }) {
  const initials = (team?.name ?? '?').split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  const style = { width: size, height: size, flexShrink: 0 };

  if (team?.logo) {
    return <img src={team.logo} alt={`Escudo de ${team.name}`} className="rounded-circle border bg-white object-fit-contain" style={style} loading="lazy" />;
  }
  return (
    <span
      className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white"
      style={{ ...style, backgroundColor: '#1E0A3C', fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

// Estado de la inscripción pagada con Flow (RF-40).
export function RegistrationBadge({ status }) {
  return status === 'INSCRITO'
    ? <span className="badge bg-success">Inscrito</span>
    : <span className="badge bg-warning text-dark">Pago pendiente</span>;
}
