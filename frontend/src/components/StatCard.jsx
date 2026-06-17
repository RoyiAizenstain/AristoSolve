export default function StatCard({ icon, title, description }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <p className="stat-card-title">{title}</p>
      <p className="stat-card-desc">{description}</p>
    </div>
  );
}
