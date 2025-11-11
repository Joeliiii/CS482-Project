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

//creating new teams
exports.create = async function(teamData) {
    let team = new teamModel(teamData);
    await team.save();
    return team;
};

// get all teams 
exports.readAll = async function() {
    return await teamModel.find({}).sort({ season: -1, name: 1 });
};

// get one team by ID
exports.readOne = async function(id) {
    return await teamModel.findById(id);
};

// get team by name
exports.readByName = async function(name) {
    return await teamModel.findOne({ name: name });
};

// get teams by season
exports.readBySeason = async function(season) {
    return await teamModel.find({ season: season }).sort({ name: 1 });
};

// update team
exports.update = async function(id, updateData) {
    let team = await teamModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );
    return team;
};

// delete one team
exports.deleteOne = async function(id) {
    let team = await teamModel.findByIdAndDelete(id);
    return team;
};

// delete all teams (for testing)
exports.deleteAll = async function() {
    await teamModel.deleteMany();
};