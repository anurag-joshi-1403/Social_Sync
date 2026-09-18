import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const EngagementChart = ({ data }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-graph-up me-2 text-primary"></i>
          Engagement Over Time
        </h5>
        <small className="text-muted">Last 30 days across all platforms</small>
      </div>
      <div className="card-body" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line
              type="monotone"
              dataKey="likes"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="Likes"
            />
            <Line
              type="monotone"
              dataKey="comments"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              name="Comments"
            />
            <Line
              type="monotone"
              dataKey="shares"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Shares"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EngagementChart;