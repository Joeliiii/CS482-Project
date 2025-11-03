// model/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    eventId:  { type: mongoose.Types.ObjectId, ref: 'Event', required: true, index: true },
    teamA:    { type: String, required: true, trim: true },
    teamB:    { type: String, required: true, trim: true },
    scoreA:   { type: Number, default: 0, min: 0 },
    scoreB:   { type: Number, default: 0, min: 0 },
    status:   { type: String, enum: ['scheduled','in_progress','final'], default: 'scheduled' },
    start:    { type: Date, required: true },
    court:    { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
