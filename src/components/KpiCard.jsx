export default function KpiCard({ title, value, footer, badge, color, icon: Icon }) {
  return (
    <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${color} rounded-3 p-3`}>
      <div className="d-flex align-items-center justify-content-between gap-2">
        <div>
          <span className="text-muted small fw-semibold">{title}</span>
          <p className="h3 fw-bold my-1 text-dark">{value}</p>
          <span className="text-muted small d-block">{footer}</span>
          {badge && (
            <span className="badge bg-secondary-subtle text-secondary-emphasis fw-medium mt-1">{badge}</span>
          )}
        </div>
        <div className={`p-3 bg-${color} bg-opacity-10 rounded-circle text-${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
