const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
admin.initializeApp();

// Use the newer syntax for scheduled functions
exports.cleanupExpiredBoards = onSchedule('every 24 hours', async (_context) => {
  const now = Date.now();
  const db = admin.database();
  
  // Query for expired boards
  const snapshot = await db.ref('boards').once('value');
  const boards = snapshot.val() || {};
  
  // Delete boards that expired over 24 hours ago
  const promises = [];
  for (const [boardId, board] of Object.entries(boards)) {
    if (board.timeSettings) {
      const endTime = board.timeSettings.startTime + (board.timeSettings.duration * 60 * 1000);
      if (endTime < (now - 24 * 60 * 60 * 1000)) {
        promises.push(db.ref(`boards/${boardId}`).remove());
      }
    }
  }
  
  await Promise.all(promises);
  console.log(`Cleaned up expired boards`);
  return null;
});