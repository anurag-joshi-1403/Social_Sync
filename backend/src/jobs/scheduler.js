const cron = require('node-cron');
const { publishDuePosts } = require('../services/publisherService');

let task = null;

function startScheduler() {
  if (task) return task; // avoid double-start

  task = cron.schedule(
    '* * * * *',
    async () => {
      try {
        await publishDuePosts();
      } catch (error) {
        console.error('❌ Scheduler error:', error.message);
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