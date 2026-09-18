import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const PlatformPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body text-center py-5 text-muted">
          <i className="bi bi-pie-chart fs-1 d-block mb-2"></i>
          <p className="mb-0">Connect accounts to see breakdown.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-semibold">
          <i className="bi bi-pie-chart me-2 text-primary"></i>
          Engagement by Platform
        </h5>
        <small className="text-muted">Share of total interactions</small>
      </div>
      <div className="card-body" style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: 13,
              }}
              formatter={(value) => `${value}%`}
            />
            <Legend
              wrapperStyle={{ fontSize: 13 }}
              formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformPieChart;