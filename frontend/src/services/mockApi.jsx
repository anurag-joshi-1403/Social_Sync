// src/services/mockApi.js
// Mock API service. Replace with real backend calls in Step 7.

const captionTemplates = {
  casual: [
    `Hey friends! Just wanted to share — ${'{topic}'}. Come check it out! ✨`,
    `Guess what? ${'{topic}'}. We're so excited to share this with you! 🎉`,
    `Okay, real talk: ${'{topic}'}. You don't want to miss this. 💫`,
  ],
  professional: [
    `We're pleased to announce: ${'{topic}'}. Learn more at the link below.`,
    `Exciting news — ${'{topic}'}. We look forward to sharing more details.`,
    `${'{topic}'}. We're committed to delivering excellence in everything we do.`,
  ],
  promotional: [
    `🔥 Limited time only! ${'{topic}'}. Don't wait — grab yours today!`,
    `${'{topic}'}. Special offer just dropped. Shop now before it's gone!`,
    `Big news! ${'{topic}'}. Tap to shop and save big this week only.`,
  ],
  inspirational: [
    `Believe in yourself. ${'{topic}'}. Small steps lead to big changes. ✨`,
    `Progress, not perfection. ${'{topic}'}. Keep going — you've got this.`,
    `Dream big. ${'{topic}'}. Every journey begins with a single step.`,
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
    // Simulate network + AI latency
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