import React, { useMemo, useState } from 'react';
import { usePosts } from '../../context/PostsContext.jsx';
import { useAccounts } from '../../context/AccountsContext.jsx';
import { generateDailyData, getTotals, getPlatformBreakdown, getTopPosts } from '../../services/mockAnalytics.js';
import KpiCard from './KpiCard.jsx';
import EngagementChart from './EngagementChart.jsx';
import PlatformPieChart from './PlatformPieChart.jsx';
import TopPostsTable from './TopPostsTable.jsx';


const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

const Analytics = () => {
  const { posts } = usePosts();
  const { accounts } = useAccounts();
  const [rangeDays, setRangeDays] = useState(30);

  const connectedPlatformIds = accounts.map((a) => a.platform);

  const dailyData = useMemo(() => generateDailyData(rangeDays), [rangeDays]);
  const totals = useMemo(() => getTotals(dailyData), [dailyData]);
  const pieData = useMemo(
    () => getPlatformBreakdown(connectedPlatformIds),
    [connectedPlatformIds.join(',')]
  );
  const topPosts = useMemo(() => getTopPosts(posts), [posts]);

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

      {/* Info banner if no accounts */}
      {accounts.length === 0 && (
        <div className="alert alert-info d-flex align-items-center small">
          <i className="bi bi-info-circle me-2 fs-5"></i>
          <div>
            You're viewing <strong>sample analytics data</strong>. Connect accounts in the{' '}
            <a href="/accounts" className="alert-link">Accounts page</a> to see your real metrics (once live).
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <KpiCard
          title="Total Likes"
          value={totals.likes}
          icon="bi-hand-thumbs-up"
          color="primary"
          delta={12}
        />
        <KpiCard
          title="Total Comments"
          value={totals.comments}
          icon="bi-chat-dots"
          color="success"
          delta={8}
        />
        <KpiCard
          title="Total Shares"
          value={totals.shares}
          icon="bi-share"
          color="warning"
          delta={-3}
        />
        <KpiCard
          title="Total Reach"
          value={totals.reach}
          icon="bi-people"
          color="info"
          delta={15}
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
                <div className="text-muted small">Total Posts Tracked</div>
                <div className="fs-5 fw-bold">{posts.length}</div>
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