// src/services/mockApi.jsx
// Mock AI content generation — will be replaced with real backend calls.

const captionTemplates = {
  casual: [
    `Hey! Just wanted to share — ${'{topic}'}. Come check it out! ✨`,
    `${'{topic}'}. So excited to share this with you all! 🎉`,
    `Real talk: ${'{topic}'}. You don't want to miss this. 💫`,
  ],
  professional: [
    `We're pleased to announce: ${'{topic}'}. Learn more at the link below.`,
    `Exciting update — ${'{topic}'}. We look forward to sharing more.`,
    `${'{topic}'}. Our team is committed to delivering excellence.`,
  ],
  promotional: [
    `🔥 Limited time! ${'{topic}'}. Don't wait — grab yours today!`,
    `${'{topic}'}. Special offer just dropped — shop now!`,
    `Big news: ${'{topic}'}. Tap to shop and save this week only.`,
  ],
  inspirational: [
    `Believe in yourself. ${'{topic}'}. Small steps lead to big change. ✨`,
    `Progress, not perfection. ${'{topic}'}. Keep going — you've got this.`,
    `Dream big. ${'{topic}'}. Every journey starts with a single step.`,
  ],
  humorous: [
    `Warning: ${'{topic}'} may cause extreme happiness. Proceed with caution 😄`,
    `Adulting is hard. But ${'{topic}'}? That's easy.`,
    `${'{topic}'}. Because why not? Life's too short for boring.`,
  ],
};

const platformHashtags = {
  instagram: ['#InstaGood', '#Explore', '#Viral', '#Trending', '#InstaDaily'],
  facebook: ['#Facebook', '#Community', '#Trending', '#Discover', '#FollowUs'],
  twitter: ['#NowTrending', '#X', '#Trending', '#News', '#Viral'],
  linkedin: ['#LinkedIn', '#Career', '#Professional', '#Growth', '#Networking'],
};

const buildTopicHashtags = (topic) => {
  return topic
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .map((w) => `#${w.replace(/[^a-z0-9]/g, '')}`)
    .filter((h) => h.length > 3);
};

export const generateContent = ({ topic, platform, tone }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const templates = captionTemplates[tone] || captionTemplates.casual;
      const platformTags = platformHashtags[platform] || platformHashtags.instagram;
      const topicTags = buildTopicHashtags(topic || '');
      const hashtags = [...topicTags, ...platformTags].slice(0, 6).join(' ');

      const options = templates.map((tpl, i) => ({
        id: `opt-${Date.now()}-${i}`,
        caption: tpl.replaceAll('{topic}', topic),
        hashtags,
      }));

      resolve({ options });
    }, 1200);
  });
};