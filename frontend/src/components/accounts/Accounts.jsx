import React from 'react';

const Accounts = () => {
  return (
    <div>
      <h2 className="page-title mb-1">Connected Accounts</h2>
      <p className="page-subtitle">Link your social media accounts to enable auto-publishing.</p>
      <div className="card shadow-sm mt-3">
        <div className="card-body text-center py-5">
          <i className="bi bi-link-45deg fs-1 text-primary"></i>
          <h5 className="mt-3">Social Connections</h5>
          <p className="text-muted mb-0">
            OAuth integration will be added in a later step.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;