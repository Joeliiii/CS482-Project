// model/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    eventId:  { type: mongoose.Types.ObjectId, ref: 'Event', required: true, index: true },
    teamA:    { type: String, required: true, trim: true },
    teamB:    { type: String, required: true, trim: true },
    scoreA:   { type: Number, default: 0, min: 0 },
    scoreB:   { type: Number, default: 0, min: 0 },
    status:   { type: String, enum: ['scheduled','in_progress','final'], default: 'scheduled', index: true },
    start:    { type: Date, required: true, index: true },
    court:    { type: String, default: '', trim: true },

    // NEW: support media + bracket structure
    videos:   { type: [String], default: [] },       // e.g., YouTube/Vimeo links or S3 URLs
}, { timestamps: true });

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
