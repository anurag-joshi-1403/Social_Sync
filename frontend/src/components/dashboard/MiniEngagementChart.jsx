import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { generateDailyData } from '../../services/mockAnalytics.js';

const MiniEngagementChart = () => {
    const data = useMemo(() => generateDailyData(14), []);

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                    <i className="bi bi-graph-up-arrow text-primary me-2"></i>
                    Engagement Trend
                </h5>
                <small className="text-muted">Last 14 days</small>
            </div>
            <div className="card-body" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="miniEngagementGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            interval="preserveStartEnd"
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                fontSize: 12,
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="likes"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fill="url(#miniEngagementGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {/* Bottom row: Mini chart + Upcoming posts */}
            <div className="row g-3 mt-3">
                <div className="col-lg-7">
                    <MiniEngagementChart />
                </div>
                <div className="col-lg-5">
                    <UpcomingPosts />
                </div>
            </div>
        </div>
    );
};

export default MiniEngagementChart;