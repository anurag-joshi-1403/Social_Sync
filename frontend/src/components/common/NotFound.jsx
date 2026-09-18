import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container text-center py-5" style={{ minHeight: '70vh' }}>
      <div style={{ fontSize: '6rem', fontWeight: 700, color: '#2563eb' }}>404</div>
      <h2 className="fw-semibold mb-2">Page Not Found</h2>
      <p className="text-muted mb-4">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <i className="bi bi-house me-2"></i>
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;