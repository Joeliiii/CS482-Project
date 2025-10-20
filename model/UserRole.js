// model/UserRole.js
const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true, index: true }
}, { timestamps: true });

// one role per user per roleId
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.models.UserRole || mongoose.model('UserRole', userRoleSchema);
