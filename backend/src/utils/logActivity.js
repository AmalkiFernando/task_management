const { ActivityLog } = require('../models');

async function logActivity({ userId, action, entityType, entityId, metadata }) {
  try {
    await ActivityLog.create({
      user_id: userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || null,
    });
  } catch (err) {
    // Logging must never break the main request flow
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = logActivity;