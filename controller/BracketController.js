// controller/BracketController.js
const mongoose = require('mongoose');
const Match = require('../model/Match');

exports.byEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!mongoose.isValidObjectId(eventId)) return res.status(400).json({ message: 'Invalid event id.' });

        const matches = await Match.find({ eventId: new mongoose.Types.ObjectId(eventId) })
            .sort({ round: 1, start: 1 })
            .lean();

        // Group by round
        const rounds = {};
        for (const m of matches) {
            const r = m.round || 1;
            (rounds[r] ||= []).push(m);
        }

        const orderedRounds = Object.keys(rounds)
            .map(n => Number(n))
            .sort((a,b)=>a-b)
            .map(n => ({ round: n, matches: rounds[n] }));

        res.json({ eventId, rounds: orderedRounds });
    } catch (e) {
        console.error('bracket byEvent error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};
