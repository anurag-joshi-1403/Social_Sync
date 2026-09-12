import React from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../../context/PostsContext.jsx';
import { PLATFORMS } from '../../context/AccountsContext.jsx';

const UpcomingPosts = () => {
  const { posts } = usePosts();

  const upcoming = posts
    .filter((p) => p.status === 'scheduled' && p.scheduledTime)
    .filter((p) => new Date(p.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    .slice(0, 5);

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-clock text-primary me-2"></i>
          Upcoming Posts
        </h5>
        <Link to="/schedule" className="btn btn-sm btn-outline-secondary">
          View All
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="card-body text-center py-4 text-muted">
          <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
          <p className="small mb-0">No upcoming posts scheduled.</p>
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {upcoming.map((post) => {
            const platform = PLATFORMS.find((p) => p.id === post.platform) || PLATFORMS[0];
            const date = new Date(post.scheduledTime);
            return (
              <li key={post.id} className="list-group-item d-flex align-items-start">
                <div
                  className="platform-icon d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{ background: platform.gradient, width: 36, height: 36, fontSize: '1rem' }}
                >
                  <i className={`bi ${platform.icon} text-white`}></i>
                </div>
                <div className="flex-grow-1 min-w-0">
                  <p className="small mb-1 text-truncate">{post.content}</p>
                  <div className="text-muted small">
                    <i className="bi bi-clock me-1"></i>
                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UpcomingPosts;