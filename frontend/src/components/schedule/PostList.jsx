import { usePosts } from '../../context/PostsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PLATFORMS } from '../../constants/platforms.js';

const statusBadge = {
  published: 'success',
  scheduled: 'primary',
  draft: 'secondary',
  failed: 'danger',
};

const PostList = ({ filter = 'all', onRowClick }) => {
  const { posts, deletePost } = usePosts();
  const toast = useToast();

  const filtered =
    filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await deletePost(id);
      toast.success('Post deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

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
            const platform = PLATFORMS.find((p) => p.id === post.platform) || PLATFORMS[0];
            const sb = statusBadge[post.status] || 'secondary';
            const when = post.scheduledTime
              ? new Date(post.scheduledTime).toLocaleString()
              : '—';
            return (
              <tr
                key={post.id}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                onClick={() => onRowClick && onRowClick(post)}
              >
                <td className="text-truncate" style={{ maxWidth: '320px' }}>
                  <div className="d-flex align-items-center">
                    {/* The list response omits base64 images; the full image
                        loads in the detail modal. */}
                    {post.hasImage && (
                      <span
                        className="me-2 rounded bg-light text-muted d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 40, height: 40 }}
                        title="This post has an image"
                      >
                        <i className="bi bi-image"></i>
                      </span>
                    )}
                    <span>{post.content}</span>
                  </div>
                </td>
                <td>
                  <span className="text-muted small">
                    <i
                      className={`bi ${platform.icon} me-1`}
                      style={{ color: platform.color }}
                    ></i>
                    {platform.name}
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
                    onClick={(e) => handleDelete(e, post.id)}
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