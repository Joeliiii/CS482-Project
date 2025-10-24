// model/AdultChildLink.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    adultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adult', required: true, index: true },
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
    relation: { type: String, required: true, trim: true }, // Parent / Guardian / Trusted Adult
    isPrimary: { type: Boolean, default: false },
    consentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consent' }
}, { timestamps: true });

linkSchema.index({ adultId: 1, childId: 1 }, { unique: true });

module.exports = mongoose.models.AdultChildLink || mongoose.model('AdultChildLink', linkSchema);
