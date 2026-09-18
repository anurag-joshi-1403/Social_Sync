import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext.jsx';
import { PLATFORMS } from '../../constants/platforms.js';
import PlatformCard from './PlatformCard.jsx';
import ConnectModal from './ConnectModal.jsx';

const Accounts = () => {
  const { accounts, getAccount, connectAccount, disconnectAccount } = useAccounts();
  const [modalPlatform, setModalPlatform] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleConnect = (platform) => {
    setModalPlatform(platform);
  };

  const handleAuthorize = async (platformId) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    try {
      await connectAccount(platformId);
      showToast(`Successfully connected ${platform.name}!`);
    } catch (err) {
      showToast(err.message || 'Connection failed');
    }
  };

  const handleDisconnect = async (platformId) => {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (!window.confirm(`Disconnect ${platform.name}? Scheduled posts for this platform will not publish.`)) {
      return;
    }
    try {
      await disconnectAccount(platformId);
      showToast(`Disconnected ${platform.name}.`);
    } catch (err) {
      showToast(err.message || 'Disconnect failed');
    }
  };

  const connectedCount = accounts.length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="page-title mb-1">Connected Accounts</h2>
          <p className="page-subtitle mb-0">
            Link your social media accounts to enable auto-publishing.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-primary fs-6">
            {connectedCount} / {PLATFORMS.length} connected
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="alert alert-success d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          {toast}
        </div>
      )}

      {/* Info banner — states plainly that these connections are simulated,
          rather than claiming security properties the app does not yet have. */}
      <div className="alert alert-warning d-flex align-items-start small">
        <i className="bi bi-info-circle me-2 fs-5"></i>
        <div>
          <strong>Demo connections.</strong> These accounts are simulated — no real
          OAuth handshake takes place and nothing is posted to the live platforms.
          Scheduled posts publish inside SocialSync only.
        </div>
      </div>

      {/* Platform cards */}
      <div className="row g-3">
        {PLATFORMS.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            account={getAccount(platform.id)}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        ))}
      </div>

      {/* Empty-state CTA */}
      {connectedCount === 0 && (
        <div className="card shadow-sm mt-4">
          <div className="card-body text-center py-5">
            <i className="bi bi-link-45deg fs-1 text-primary d-block mb-3"></i>
            <h5 className="fw-semibold">No accounts connected yet</h5>
            <p className="text-muted mb-3">
              Connect at least one account to start scheduling posts.
            </p>
          </div>
        </div>
      )}

      {/* Ready-to-go CTA */}
      {connectedCount > 0 && (
        <div className="card shadow-sm mt-4 border-success">
          <div className="card-body d-flex align-items-center justify-content-between flex-wrap">
            <div>
              <h6 className="fw-semibold mb-1">
                <i className="bi bi-check-circle text-success me-2"></i>
                You're all set!
              </h6>
              <p className="text-muted small mb-0">
                You can now schedule posts to your connected platforms.
              </p>
            </div>
            <Link to="/editor" className="btn btn-primary mt-3 mt-md-0">
              <i className="bi bi-plus-lg me-1"></i>
              Create Post
            </Link>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalPlatform && (
        <ConnectModal
          platform={modalPlatform}
          onClose={() => setModalPlatform(null)}
          onAuthorize={handleAuthorize}
        />
      )}
    </div>
  );
};

export default Accounts;