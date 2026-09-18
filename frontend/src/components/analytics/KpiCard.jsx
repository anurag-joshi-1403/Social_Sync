
const KpiCard = ({ title, value, icon, color, delta }) => {
  const isPositive = delta > 0;

  return (
    <div className="col-6 col-lg-3">
      <div className="card stats-card shadow-sm h-100">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className={`stats-icon bg-${color}-subtle text-${color}`}>
              <i className={`bi ${icon}`}></i>
            </div>
            {delta !== undefined && (
              <span className={`badge bg-${isPositive ? 'success' : 'danger'}-subtle text-${isPositive ? 'success' : 'danger'}`}>
                <i className={`bi bi-arrow-${isPositive ? 'up' : 'down'}-right me-1`}></i>
                {Math.abs(delta)}%
              </span>
            )}
          </div>
          <div className="text-muted small">{title}</div>
          <div className="fs-4 fw-bold">{value.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;