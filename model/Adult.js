// model/Adult.js
const mongoose = require('mongoose');

const adultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    legalName: { type: String, default: '' },
    address: { type: String, default: '' },
    govIdType: { type: String, enum: ['passport', 'license', 'realid'], default: '' },
    govIdLast4: { type: String, default: '' }, // store as string since it's not a number semantically
    photoUrl: { type: String, default: '' }
}, { timestamps: true });

adultSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.models.Adult || mongoose.model('Adult', adultSchema);
