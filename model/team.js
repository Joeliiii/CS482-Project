// model/team.js

const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    season: {
        type: String,
        required: true,
        trim: true, // e.g. "2025"
    },
    coach: {
        type: String,
        default: '',
        trim: true,
    },
    logo: {
        type: String,
        default: '', // URL/path when you add uploads later
        trim: true,
    },
    wins: {
        type: Number,
        default: 0,
    },
    losses: {
        type: Number,
        default: 0,
    },
    playerCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// unique team per season
TeamSchema.index({ name: 1, season: 1 }, { unique: true });

// standard Mongoose model
const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

module.exports = Team;
