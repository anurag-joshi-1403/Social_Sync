const cron = require('node-cron');
const {
  publishDuePosts,
  releaseStaleClaims,
} = require('../services/publisherService');

let task = null;
let running = false;

function startScheduler() {
  if (task) return task; // avoid double-start

  // Recover anything a previous process left mid-publish.
  releaseStaleClaims().catch((error) =>
    console.error('❌ Stale claim sweep failed:', error.message)
  );

  task = cron.schedule(
    '* * * * *',
    async () => {
      // A slow run must not overlap the next tick.
      if (running) {
        console.log('⏰ Previous scheduler run still in progress — skipping tick');
        return;
      }
      running = true;
      try {
        await publishDuePosts();
      } catch (error) {
        console.error('❌ Scheduler error:', error.message);
      } finally {
        running = false;
      }
    },
    {
      scheduled: true,
      recoverMissedExecutions: false, // ← stops the "missed execution" warnings
    }
  );

  console.log('⏰ Scheduler started — checking every minute for due posts');
  return task;
}

function stopScheduler() {
  if (task) {
    task.stop();
    task = null;
    console.log('⏰ Scheduler stopped');
  }
}

module.exports = { startScheduler, stopScheduler };