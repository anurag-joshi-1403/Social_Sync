// src/services/mockAnalytics.js
// Generates deterministic mock analytics data.
// Later this will be replaced by real API calls to platform analytics endpoints.

import { PLATFORMS } from '../context/AccountsContext.jsx';

// Generate the last N days of engagement data
export const generateDailyData = (days = 30) => {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Deterministic pseudo-random based on date + index for a stable-looking chart
    const seed = date.getDate() * 7 + i * 13;
    const likes = 40 + (seed % 60) + Math.floor(Math.sin(i / 3) * 25);
    const comments = 5 + (seed % 12) + Math.floor(Math.cos(i / 4) * 6);
    const shares = 2 + (seed % 8);
    const reach = 300 + (seed % 400) + Math.floor(Math.sin(i / 2) * 150);

    data.push({
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      likes: Math.max(0, likes),
      comments: Math.max(0, comments),
      shares: Math.max(0, shares),
      reach: Math.max(0, reach),
    });
  }

  return data;
};

// Aggregate totals from daily data
export const getTotals = (dailyData) => {
  return dailyData.reduce(
    (acc, d) => ({
      likes: acc.likes + d.likes,
      comments: acc.comments + d.comments,
      shares: acc.shares + d.shares,
      reach: acc.reach + d.reach,
      engagement: acc.engagement + d.likes + d.comments + d.shares,
    }),
    { likes: 0, comments: 0, shares: 0, reach: 0, engagement: 0 }
  );
};

// Platform breakdown (share of total engagement)
export const getPlatformBreakdown = (connectedPlatforms) => {
  const base = connectedPlatforms.length > 0 ? connectedPlatforms : ['instagram'];

  return base.map((platformId, i) => {
    const platform = PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
    // Deterministic distribution
    const weights = [45, 30, 15, 10];
    const value = weights[i % weights.length] + (platformId.length % 5);
    return {
      name: platform.name,
      value,
      color: platform.color,
      icon: platform.icon,
      platformId,
    };
  });
};

// Top performing posts (from user's own posts + random metrics)
export const getTopPosts = (posts) => {
  if (!posts || posts.length === 0) return [];

  return posts.slice(0, 5).map((post, i) => {
    const seed = (post.content?.length || 20) * (i + 3);
    return {
      id: post.id,
      content: post.content,
      platform: post.platform,
      image: post.image,
      likes: 20 + (seed % 80),
      comments: 3 + (seed % 15),
      shares: 1 + (seed % 10),
      reach: 200 + (seed % 600),
      engagement: 20 + (seed % 80) + 3 + (seed % 15) + 1 + (seed % 10),
    };
  }).sort((a, b) => b.engagement - a.engagement);
};