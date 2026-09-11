import React, { useState } from 'react';

const ConnectModal = ({ platform, onClose, onAuthorize }) => {
  const [loading, setLoading] = useState(false);

  const handleAuthorize = async () => {
    setLoading(true);
    await onAuthorize(platform.id);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-semibold">Authorize SocialSync</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body">
              <div className="text-center mb-4">
                <div
                  className="platform-icon mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{ background: platform.gradient, width: 64, height: 64, fontSize: '1.8rem' }}
                >
                  <i className={`bi ${platform.icon} text-white`}></i>
                </div>
                <h6 className="fw-semibold mb-1">
                  SocialSync wants to access your {platform.name} account
                </h6>
                <p className="text-muted small mb-0">
                  You'll be redirected to {platform.name} to complete this safely.
                </p>
              </div>

              <div className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <small className="text-uppercase text-muted fw-bold d-block mb-2">
                  This will allow SocialSync to:
                </small>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Read your profile information
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Publish posts on your behalf
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Read engagement metrics (likes, comments, shares)
                  </li>
                </ul>
              </div>

              <div className="alert alert-warning small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                <strong>Demo mode:</strong> No real data will be accessed. This simulates the real OAuth flow.
              </div>
            </div>

            <div className="modal-footer border-0">
              <button
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAuthorize}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check me-1"></i>
                    Authorize
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConnectModal;