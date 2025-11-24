// routes/publicEvents.js
const express = require('express');
const router = express.Router();

let Event = null;
try { Event = require('../model/Event'); } catch (_) { /* optional */ }

// GET /api/events?from=&to=
// Returns { items: [...] }
router.get('/', async (req, res) => {
    try {
        if (!Event) return res.status(501).json({ message: 'Events not available.' });

        const { from, to } = req.query;
        const find = {};
        if (from || to) find.start = {};
        if (from) find.start.$gte = new Date(from);
        if (to)   find.start.$lte = new Date(to);

        const items = await Event.find(find).sort({ start: 1 }).lean();
        res.json({ items });
    } catch (e) {
        console.error('public events error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});

// (Optional) GET /api/events/:id
router.get('/:id', async (req, res) => {
    try {
        if (!Event) return res.status(501).json({ message: 'Events not available.' });
        const ev = await Event.findById(req.params.id).lean();
        if (!ev) return res.status(404).json({ message: 'Event not found.' });
        res.json(ev);
    } catch (e) {
        console.error('public event by id error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
