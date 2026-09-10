const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="col-6 col-lg-3">
      <div className="card stats-card shadow-sm h-100">
        <div className="card-body d-flex align-items-center">
          <div className={`stats-icon bg-${color}-subtle text-${color} me-3`}>
            <i className={`bi ${icon}`}></i>
          </div>
          <div>
            <div className="text-muted small">{title}</div>
            <div className="fs-4 fw-bold">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;