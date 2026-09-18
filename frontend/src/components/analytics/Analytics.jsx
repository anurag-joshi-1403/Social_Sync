import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext.jsx';
import { PLATFORMS } from '../../constants/platforms.js';
import { analyticsService } from '../../services/analyticsService.js';
import KpiCard from './KpiCard.jsx';
import EngagementChart from './EngagementChart.jsx';
import PlatformPieChart from './PlatformPieChart.jsx';
import TopPostsTable from './TopPostsTable.jsx';

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

const EMPTY_TOTALS = { likes: 0, comments: 0, shares: 0, reach: 0, engagement: 0 };

const Analytics = () => {
  const { accounts } = useAccounts();
  const [rangeDays, setRangeDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Loading is derived, not stored: whenever the data in hand is for a
  // different range than the one selected, a request is still in flight.
  // This keeps the effect free of synchronous setState calls and shows the
  // previous range's numbers instead of flashing empty while fetching.
  const loading = !error && data?.range !== rangeDays;

  useEffect(() => {
    let active = true;

    analyticsService
      .summary(rangeDays)
      .then((result) => {
        if (!active) return;
        setError('');
        setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load analytics');
      });

    return () => {
      active = false;
    };
  }, [rangeDays]);

  const dailyData = data?.daily || [];
  const totals = data?.totals || EMPTY_TOTALS;
  const topPosts = data?.topPosts || [];
  const postsTracked = data?.postsTracked || 0;

  // Attach display metadata to the platform engagement the API returned.
  const pieData = useMemo(
    () =>
      (data?.platforms || []).map((entry) => {
        const platform =
          PLATFORMS.find((p) => p.id === entry.platformId) || PLATFORMS[0];
        return {
          name: platform.name,
          value: entry.value,
          color: platform.color,
          icon: platform.icon,
          platformId: entry.platformId,
        };
      }),
    [data]
  );

  const engagementRate =
    totals.reach > 0 ? ((totals.engagement / totals.reach) * 100).toFixed(2) : '0.00';

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="page-title mb-1">Analytics</h2>
          <p className="page-subtitle mb-0">
            Track engagement metrics across all your connected platforms.
          </p>
        </div>

        {/* Range selector */}
        <div className="btn-group mt-3 mt-md-0">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              className={`btn btn-sm ${
                rangeDays === opt.days ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => setRangeDays(opt.days)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center small">
          <i className="bi bi-exclamation-circle me-2 fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div className="alert alert-light d-flex align-items-center small">
          <span className="spinner-border spinner-border-sm me-2" />
          Loading your engagement data...
        </div>
      )}

      {/* Nothing published yet — explain why the numbers are zero */}
      {!loading && !error && postsTracked === 0 && (
        <div className="alert alert-info d-flex align-items-center small">
          <i className="bi bi-info-circle me-2 fs-5"></i>
          <div>
            No published posts in this range yet, so there is nothing to measure.{' '}
            {accounts.length === 0 ? (
              <>
                Connect an account on the{' '}
                <Link to="/accounts" className="alert-link">
                  Accounts page
                </Link>{' '}
                to get started.
              </>
            ) : (
              <>
                Schedule a post from the{' '}
                <Link to="/editor" className="alert-link">
                  editor
                </Link>{' '}
                and its metrics will appear here once it publishes.
              </>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {/* No `delta` — period-over-period comparison is not computed yet, and
            a hardcoded percentage would be a fabricated number. */}
        <KpiCard
          title="Total Likes"
          value={totals.likes}
          icon="bi-hand-thumbs-up"
          color="primary"
        />
        <KpiCard
          title="Total Comments"
          value={totals.comments}
          icon="bi-chat-dots"
          color="success"
        />
        <KpiCard
          title="Total Shares"
          value={totals.shares}
          icon="bi-share"
          color="warning"
        />
        <KpiCard
          title="Total Reach"
          value={totals.reach}
          icon="bi-people"
          color="info"
        />
      </div>

      {/* Secondary stats row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="stats-icon bg-primary-subtle text-primary me-3">
                <i className="bi bi-activity"></i>
              </div>
              <div>
                <div className="text-muted small">Total Engagement</div>
                <div className="fs-5 fw-bold">{totals.engagement.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="stats-icon bg-success-subtle text-success me-3">
                <i className="bi bi-percent"></i>
              </div>
              <div>
                <div className="text-muted small">Engagement Rate</div>
                <div className="fs-5 fw-bold">{engagementRate}%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex align-items-center">
              <div className="stats-icon bg-warning-subtle text-warning me-3">
                <i className="bi bi-file-earmark-text"></i>
              </div>
              <div>
                <div className="text-muted small">Posts Published</div>
                <div className="fs-5 fw-bold">{postsTracked}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <EngagementChart data={dailyData} />
        </div>
        <div className="col-lg-4">
          <PlatformPieChart data={pieData} />
        </div>
      </div>

      {/* Top Posts */}
      <TopPostsTable posts={topPosts} />
    </div>
  );
};

export default Analytics;