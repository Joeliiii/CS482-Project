// controller/MatchController.js
const mongoose = require('mongoose');
const Match = require('../model/Match');

/**
 * Create a match
 * Body: { eventId, teamA, teamB, start, court? }
 */
exports.create = async (req, res) => {
    try {
        const { eventId, teamA, teamB, start, court = '' } = req.body || {};
        if (!eventId || !teamA || !teamB || !start) {
            return res.status(400).json({ message: 'eventId, teamA, teamB, start required.' });
        }
        if (!mongoose.isValidObjectId(eventId)) {
            return res.status(400).json({ message: 'Invalid eventId' });
        }

        const match = await Match.create({
            eventId: new mongoose.Types.ObjectId(eventId),
            teamA: String(teamA).trim(),
            teamB: String(teamB).trim(),
            start: new Date(start),
            court: String(court || '').trim(),
        });

        res.status(201).json(match);
    } catch (e) {
        console.error('matches create error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/**
 * List matches (optionally by event)
 * Query: ?eventId=<id>
 */
exports.list = async (req, res) => {
    try {
        const { eventId } = req.query;
        const find = {};
        if (eventId) {
            if (!mongoose.isValidObjectId(eventId)) {
                return res.status(400).json({ message: 'Invalid eventId' });
            }
            find.eventId = new mongoose.Types.ObjectId(eventId);
        }
        const items = await Match.find(find).sort({ start: 1 }).lean();
        res.json(items);
    } catch (e) {
        console.error('matches list error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/**
 * Update a match by id
 * Body can include: scoreA, scoreB, status, start, court, teamA, teamB, eventId
 */
exports.update = async (req, res) => {
    try {
        const { matchId } = req.params;
        if (!mongoose.isValidObjectId(matchId)) {
            return res.status(400).json({ message: 'Invalid matchId' });
        }

        const patch = {};
        ['scoreA','scoreB','status','start','court','teamA','teamB','eventId'].forEach(k => {
            if (req.body[k] !== undefined) patch[k] = req.body[k];
        });

        if (patch.eventId) {
            if (!mongoose.isValidObjectId(patch.eventId)) {
                return res.status(400).json({ message: 'Invalid eventId' });
            }
            patch.eventId = new mongoose.Types.ObjectId(patch.eventId);
        }
        if (patch.start) patch.start = new Date(patch.start);

        const updated = await Match.findByIdAndUpdate(matchId, patch, { new: true }).lean();
        if (!updated) return res.status(404).json({ message: 'Match not found.' });
        res.json(updated);
    } catch (e) {
        console.error('matches update error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/**
 * Delete a match by id
 */
exports.remove = async (req, res) => {
    try {
        const { matchId } = req.params;
        if (!mongoose.isValidObjectId(matchId)) {
            return res.status(400).json({ message: 'Invalid matchId' });
        }
        const out = await Match.findByIdAndDelete(matchId).lean();
        if (!out) return res.status(404).json({ message: 'Match not found.' });
        res.json({ message: 'Match deleted.' });
    } catch (e) {
        console.error('matches remove error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};
