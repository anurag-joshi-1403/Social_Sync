const Post = require('../models/Post');
const SocialAccount = require('../models/SocialAccount');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const publishPost = async (post) => {
  try {
    const account = await SocialAccount.findOne({
      user: post.user,
      platform: post.platform,
    });

    if (!account) {
      post.status = 'failed';
      post.failureReason = `No connected ${post.platform} account`;
      await post.save();
      console.log(`   ❌ Failed: no ${post.platform} account connected`);
      return { success: false, reason: 'no account' };
    }

    await new Promise((resolve) => setTimeout(resolve, randomInt(100, 400)));

    const mockPlatformPostId = `mock-${post.platform}-${Date.now()}`;
    const mockEngagement = {
      likes: randomInt(5, 80),
      comments: randomInt(0, 15),
      shares: randomInt(0, 10),
      reach: randomInt(100, 800),
    };

    post.status = 'published';
    post.publishedTime = new Date();
    post.platformPostId = mockPlatformPostId;
    post.engagement = mockEngagement;
    post.failureReason = '';
    await post.save();

    console.log(`   ✅ Published to ${post.platform} (id: ${mockPlatformPostId})`);
    return { success: true, post };
  } catch (error) {
    console.error(`   ⚠️  Publish error: ${error.message}`);
    post.status = 'failed';
    post.failureReason = error.message;
    await post.save();
    return { success: false, reason: error.message };
  }
};

const publishDuePosts = async () => {
  const now = new Date();

  const duePosts = await Post.find({
    status: 'scheduled',
    scheduledTime: { $lte: now },
  }).limit(50);

  if (duePosts.length === 0) return { published: 0, failed: 0 };

  console.log(`\n⏰ Scheduler: ${duePosts.length} post(s) due`);

  let published = 0;
  let failed = 0;

  for (const post of duePosts) {
    console.log(`   → Publishing post ${post._id} (${post.platform})`);
    const result = await publishPost(post);
    if (result.success) published++;
    else failed++;
  }

  console.log(`⏰ Scheduler done: ${published} published, ${failed} failed\n`);
  return { published, failed };
};

module.exports = { publishPost, publishDuePosts };