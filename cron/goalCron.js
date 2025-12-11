const cron = require('node-cron');

const goalUtils = require('../utils/goalUtils');

cron.schedule('0 3 * * *', async () => {
  console.log('[CRON] Checking goal statuses...');

  try {
    await goalUtils.checkAllGoals();
    console.log('[CRON] Done.');
  } catch (err) {
    console.error('[CRON ERROR]', err);
  }
});
