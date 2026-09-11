import React from 'react';
import { PLATFORMS } from '../../context/AccountsContext.jsx';

const PlatformCard = ({ platform, account, onConnect, onDisconnect }) => {
  const isConnected = Boolean(account);

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card shadow-sm h-100 platform-card">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-center mb-3">
            <div
              className="platform-icon d-flex align-items-center justify-content-center"
              style={{ background: platform.gradient }}
            >
              <i className={`bi ${platform.icon} text-white`}></i>
            </div>
            <div className="ms-3">
              <h5 className="mb-0 fw-semibold">{platform.name}</h5>
              <small className="text-muted">{platform.description}</small>
            </div>
          </div>

          {isConnected ? (
            <>
              <div className="alert alert-success py-2 px-3 small d-flex align-items-center mb-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>
                  Connected as <strong>@{account.username}</strong>
                </div>
              </div>
              <div className="mt-auto d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="bi bi-clock-history me-1"></i>
                  {new Date(account.connectedAt).toLocaleDateString()}
                </small>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDisconnect(platform.id)}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted small mb-3">
                Not connected. Link your {platform.name} account to schedule and publish posts automatically.
              </p>
              <button
                className="btn btn-outline-dark mt-auto"
                onClick={() => onConnect(platform)}
              >
                <i className="bi bi-link-45deg me-1"></i>
                Connect {platform.name}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { PlatformCard };
export default PlatformCard;