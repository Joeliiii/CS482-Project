// routes/publicMatches.js
const express = require('express');
const router = express.Router();

let Match = null;
try { Match = require('../model/Match'); } catch (_) { /* optional */ }

// Build a filter from query params
function buildMatchFind({ eventId, status, team, from, to }) {
    const find = {};
    if (eventId) find.eventId = eventId; // mongoose will cast
    if (status) find.status = status;     // scheduled | in_progress | final

    if (team) {
        find.$or = [{ teamA: team }, { teamB: team }];
    }

    if (from || to) {
        find.start = {};
        if (from) find.start.$gte = new Date(from);
        if (to)   find.start.$lte = new Date(to);
    }
    return find;
}

// GET /api/matches?eventId=&status=&team=&from=&to=
// Returns array (for convenience with your UI) OR {items: [...]}
router.get('/', async (req, res) => {
    try {
        if (!Match) return res.status(501).json({ message: 'Matches not available.' });

        const find = buildMatchFind(req.query);
        const items = await Match.find(find).sort({ start: 1 }).lean();

        // Return as array for simplicity; your pages handle array or {items}
        res.json(items);
    } catch (e) {
        console.error('public matches error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Optional nicer alias for history:
// GET /api/matches/history?team=&from=&to=
router.get('/history', async (req, res) => {
    try {
        if (!Match) return res.status(501).json({ message: 'Matches not available.' });

        const find = buildMatchFind({ ...req.query /* could include team/from/to */ });
        // If you only want finals in history, uncomment next line:
        // find.status = 'final';

        const items = await Match.find(find).sort({ start: -1 }).lean();
        res.json(items);
    } catch (e) {
        console.error('public matches history error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
