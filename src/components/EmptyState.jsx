export default function EmptyState({ title, children }) {
  return (
    <div className="text-center py-5 px-3">
      <h3 className="h5 fw-bold text-dark">{title}</h3>
      <p className="text-muted mb-0">{children}</p>
    </div>
  );
}
