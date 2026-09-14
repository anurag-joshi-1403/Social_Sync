import React, { useState, useEffect } from 'react';
import { usePosts } from '../../context/PostsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PLATFORMS } from '../../context/AccountsContext.jsx';

const PostDetailModal = ({ post, onClose }) => {
  const { updatePost, deletePost } = usePosts();
  const toast = useToast();

  const [editMode, setEditMode] = useState(false);
  const [caption, setCaption] = useState(post.content);
  const [hashtags, setHashtags] = useState(post.hashtags || '');
  const [scheduleTime, setScheduleTime] = useState(
    post.scheduledTime ? post.scheduledTime.slice(0, 16) : ''
  );

  useEffect(() => {
    setCaption(post.content);
    setHashtags(post.hashtags || '');
    setScheduleTime(post.scheduledTime ? post.scheduledTime.slice(0, 16) : '');
    setEditMode(false);
  }, [post]);

  const platform = PLATFORMS.find((p) => p.id === post.platform) || PLATFORMS[0];

  const statusBadge =
    {
      published: 'success',
      scheduled: 'primary',
      draft: 'secondary',
      failed: 'danger',
    }[post.status] || 'secondary';

  const handleSave = async () => {
    if (!caption.trim()) {
      toast.error('Caption cannot be empty.');
      return;
    }
    try {
      await updatePost(post.id, {
        content: caption,
        hashtags,
        scheduledTime: scheduleTime
          ? new Date(scheduleTime).toISOString()
          : null,
      });
      toast.success('Post updated successfully.');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await deletePost(post.id);
      toast.success('Post deleted.');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0">
            <div className="d-flex align-items-center">
              <div
                className="platform-icon d-flex align-items-center justify-content-center me-3"
                style={{
                  background: platform.gradient,
                  width: 42,
                  height: 42,
                  fontSize: '1.1rem',
                }}
              >
                <i className={`bi ${platform.icon} text-white`}></i>
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-semibold">Post Details</h5>
                <small className="text-muted">
                  {platform.name} ·{' '}
                  <span className={`badge bg-${statusBadge} text-capitalize`}>
                    {post.status}
                  </span>
                </small>
              </div>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {post.image && (
              <img
                src={post.image}
                alt="post"
                className="img-fluid rounded mb-3"
                style={{ maxHeight: '260px', objectFit: 'cover', width: '100%' }}
              />
            )}

            {editMode ? (
              <>
                <div className="mb-3">
                  <label className="form-label">Caption</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Hashtags</label>
                  <input
                    type="text"
                    className="form-control"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Scheduled Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                  <small className="text-muted">
                    Leave empty to keep as draft (no schedule).
                  </small>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 fs-6">{post.content}</p>
                {post.hashtags && (
                  <p className="text-primary mb-3 small">{post.hashtags}</p>
                )}

                <div className="row g-2 small text-muted">
                  <div className="col-md-6">
                    <i className="bi bi-calendar-event me-1"></i>
                    {post.scheduledTime
                      ? new Date(post.scheduledTime).toLocaleString()
                      : 'No schedule set'}
                  </div>
                  <div className="col-md-6">
                    <i className="bi bi-clock-history me-1"></i>
                    Created{' '}
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : '—'}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer border-0">
            {editMode ? (
              <>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="bi bi-check-lg me-1"></i>
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-outline-danger me-auto"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete
                </button>
                <button className="btn btn-outline-secondary" onClick={onClose}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;