import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from './StatsCard';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data — will be replaced with real API calls later
  const stats = {
    total: 42,
    scheduled: 8,
    published: 30,
    drafts: 4,
  };

  const recentPosts = [
    {
      id: 1,
      content: 'Good things brew here. Our doors are officially open!',
      platform: 'Instagram',
      status: 'published',
      date: '2026-09-09 10:30',
    },
    {
      id: 2,
      content: 'Our biggest sale of the year is here. Up to 40% off!',
      platform: 'Facebook',
      status: 'scheduled',
      date: '2026-09-12 18:00',
    },
    {
      id: 3,
      content: "We're expanding our engineering team...",
      platform: 'LinkedIn',
      status: 'scheduled',
      date: '2026-09-14 09:00',
    },
    {
      id: 4,
      content: 'Progress, not perfection. Small steps win.',
      platform: 'X (Twitter)',
      status: 'draft',
      date: '—',
    },
    {
      id: 5,
      content: 'Behind the scenes at our studio today ☕',
      platform: 'Instagram',
      status: 'published',
      date: '2026-09-05 15:45',
    },
  ];

  const statusBadge = (status) => {
    const map = {
      published: 'success',
      scheduled: 'primary',
      draft: 'secondary',
      failed: 'danger',
    };
    return `badge bg-${map[status] || 'secondary'} text-capitalize`;
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="page-title mb-1">Welcome back, {user?.name} 👋</h2>
          <p className="page-subtitle mb-0">Here's a quick overview of your content activity.</p>
        </div>
        <Link to="/editor" className="btn btn-primary mt-3 mt-md-0">
          <i className="bi bi-plus-lg me-1"></i>
          Create New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <StatsCard title="Total Posts" value={stats.total} icon="bi-collection" color="primary" />
        <StatsCard title="Scheduled" value={stats.scheduled} icon="bi-calendar-event" color="info" />
        <StatsCard title="Published" value={stats.published} icon="bi-check-circle" color="success" />
        <StatsCard title="Drafts" value={stats.drafts} icon="bi-pencil" color="warning" />
      </div>

      {/* Recent Posts */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0 fw-semibold">Recent Posts</h5>
          <Link to="/schedule" className="btn btn-sm btn-outline-secondary">
            View All
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Content</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id}>
                  <td className="text-truncate" style={{ maxWidth: '280px' }}>
                    {post.content}
                  </td>
                  <td>
                    <span className="text-muted small">{post.platform}</span>
                  </td>
                  <td>
                    <span className={statusBadge(post.status)}>{post.status}</span>
                  </td>
                  <td className="text-muted small">{post.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;