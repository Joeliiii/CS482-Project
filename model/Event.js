// model/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    location:    { type: String, default: '', trim: true },
    start:       { type: Date,   required: true },
    end:         { type: Date,   required: true },
    // optional tags/league/tournamentId if you need it later
}, { timestamps: true });

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
