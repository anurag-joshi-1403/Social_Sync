import React from 'react';
import { usePosts } from '../../context/PostsContext.jsx';

const platformBadge = {
  instagram: { icon: 'bi-instagram', color: 'danger' },
  facebook: { icon: 'bi-facebook', color: 'primary' },
  twitter: { icon: 'bi-twitter-x', color: 'dark' },
  linkedin: { icon: 'bi-linkedin', color: 'info' },
};

const statusBadge = {
  published: 'success',
  scheduled: 'primary',
  draft: 'secondary',
  failed: 'danger',
};

const PostList = ({ filter = 'all' }) => {
  const { posts, deletePost } = usePosts();

  const filtered =
    filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
        <p className="mb-0">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Content</th>
            <th>Platform</th>
            <th>Status</th>
            <th>Date</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((post) => {
            const pf = platformBadge[post.platform] || platformBadge.instagram;
            const sb = statusBadge[post.status] || 'secondary';
            const when = post.scheduledTime
              ? new Date(post.scheduledTime).toLocaleString()
              : '—';
            return (
              <tr key={post.id}>
                <td className="text-truncate" style={{ maxWidth: '320px' }}>
                  <div className="d-flex align-items-center">
                    {post.image && (
                      <img
                        src={post.image}
                        alt="thumb"
                        className="me-2 rounded"
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                      />
                    )}
                    <span>{post.content}</span>
                  </div>
                </td>
                <td>
                  <span className="text-muted small">
                    <i className={`bi ${pf.icon} me-1 text-${pf.color}`}></i>
                    {post.platform}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${sb} text-capitalize`}>
                    {post.status}
                  </span>
                </td>
                <td className="text-muted small">{when}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deletePost(post.id)}
                    title="Delete post"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PostList;