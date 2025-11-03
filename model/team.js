// model/team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        season: { type: String, required: true, trim: true }, // e.g. "2025"
        coach: { type: String, default: '', trim: true },
        logo: { type: String, default: 'logo.png', trim: true },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        playerCount: { type: Number, default: 0 },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Single compound unique index — avoids duplicate-index warnings
TeamSchema.index({ name: 1, season: 1 }, { unique: true });

// Create or reuse the model safely (prevents OverwriteModelError)
const Team =
    mongoose.models.Team || mongoose.model('Team', TeamSchema);


Team.readAll = function () {
    return this.find({});
};

Team.readOne = function (id) {
    return this.findById(id);
};

Team.readByName = function (name) {
    return this.findOne({ name });
};

Team.readBySeason = function (season) {
    return this.find({ season });
};


Team.update = function (id, updateData) {
    return this.findByIdAndUpdate(id, updateData, { new: true });
};

Team.deleteOne = function (id) {
    // wrapper to keep old signature deleteOne(id)
    return this.findByIdAndDelete(id);
};

Team.deleteAll = function () {
    return this.deleteMany({});
};

module.exports = Team;
