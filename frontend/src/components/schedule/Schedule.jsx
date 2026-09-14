import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { usePosts } from '../../context/PostsContext.jsx';
import PostList from './PostList.jsx';
import PostDetailModal from './PostDetailModal.jsx';

const Schedule = () => {
  const { posts, loading } = usePosts();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  // Map posts by YYYY-MM-DD
  const postsByDate = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      if (p.scheduledTime) {
        const key = new Date(p.scheduledTime).toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    });
    return map;
  }, [posts]);

  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const postsOnSelected = postsByDate[selectedKey] || [];

  // Show a dot on days with posts
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const key = date.toISOString().slice(0, 10);
    const dayPosts = postsByDate[key];
    if (!dayPosts || dayPosts.length === 0) return null;
    return (
      <div className="calendar-dots">
        {dayPosts.slice(0, 3).map((p, i) => (
          <span
            key={i}
            className={`calendar-dot dot-${p.status}`}
          ></span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="page-title mb-1">Schedule</h2>
          <p className="page-subtitle mb-0">
            Plan and view your upcoming posts on a calendar.
          </p>
        </div>
        <div className="btn-group mt-3 mt-md-0">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'
              }`}
            onClick={() => setFilter('all')}
          >
            All ({posts.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'scheduled' ? 'btn-primary' : 'btn-outline-primary'
              }`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button
            className={`btn btn-sm ${filter === 'draft' ? 'btn-primary' : 'btn-outline-primary'
              }`}
            onClick={() => setFilter('draft')}
          >
            Drafts
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Calendar */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="w-100 border-0"
              />
              <div className="d-flex gap-3 mt-3 small text-muted justify-content-center">
                <span><span className="calendar-dot dot-scheduled me-1"></span>Scheduled</span>
                <span><span className="calendar-dot dot-draft me-1"></span>Draft</span>
                <span><span className="calendar-dot dot-published me-1"></span>Published</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Posts */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-calendar-day me-2 text-primary"></i>
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h5>
            </div>
            <div className="card-body p-0">
              {postsOnSelected.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                  <p className="mb-0">No posts scheduled for this day.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {postsOnSelected.map((p) => (
                    <li key={p.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold small mb-1">
                            {new Date(p.scheduledTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            <span className="badge bg-light text-dark ms-2 text-capitalize">
                              {p.platform}
                            </span>
                          </div>
                          <p className="small mb-0 text-muted">{p.content}</p>
                        </div>
                        <span className={`badge bg-${p.status === 'published' ? 'success' :
                          p.status === 'scheduled' ? 'primary' : 'secondary'
                          } text-capitalize`}>
                          {p.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All Posts */}
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">All Posts</h5>
        </div>
        <div className="card-body p-0">
          <PostList filter={filter} onRowClick={setSelectedPost} />
          {selectedPost && (
            <PostDetailModal
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;