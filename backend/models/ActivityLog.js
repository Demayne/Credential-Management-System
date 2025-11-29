const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'credential_view',
      'credential_add',
      'credential_edit',
      'credential_delete',
      'user_create',
      'user_update',
      'user_delete',
      'assignment_add',
      'assignment_remove',
      'role_change',
      'password_change',
      'profile_update'
    ]
  },
  resourceType: {
    type: String,
    enum: ['credential', 'user', 'division', 'organizationalUnit', 'system']
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

