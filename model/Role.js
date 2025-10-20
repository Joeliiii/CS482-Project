// model/Role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. 'admin', 'manager', 'user'
    displayName: { type: String, required: true, trim: true } // e.g. 'Admin', 'Team Manager', 'User'
}, { timestamps: true });

roleSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema);
