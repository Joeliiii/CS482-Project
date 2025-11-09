// routes/team.js

const express = require('express');
const router = express.Router();
const Team = require('../model/team'); // Mongoose Team model

router.post('/', async (req, res) => {
    try {
        const { name, season, coach = '', logo = '' } = req.body;

        if (!name || !season) {
            return res.status(400).json({ error: 'Team name and season are required' });
        }

        if (!/^\d{4}$/.test(String(season))) {
            return res.status(400).json({ error: 'Invalid season format (use YYYY)' });
        }

        const team = await Team.create({
            name: name.trim(),
            season: String(season),
            coach: coach.trim(),
            logo: logo.trim(),
        });

        res.status(201).json({
            message: 'Team created successfully!',
            id: team._id,
            team,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Team already exists in this season' });
        }
        console.error('Team creation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/', async (req, res) => {
    try {
        const teams = await Team.find().sort({ season: -1, name: 1 }).lean();
        res.status(200).json(teams);
    } catch (err) {
        console.error('Fetch teams error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/with-players', async (req, res) => {
    try {
        const teams = await Team.find().sort({ season: -1, name: 1 }).lean();

        // For now, players is just an empty array.
        // Later you can populate from a TeamPlayer / Child link.
        const enriched = teams.map(t => ({
            id: t._id,
            name: t.name,
            season: t.season,
            coach: t.coach || '',
            logo: t.logo || '',
            wins: t.wins ?? 0,
            losses: t.losses ?? 0,
            playerCount: t.playerCount ?? 0,
            players: [] // TODO: wire real roster here
        }));

        res.json(enriched);
    } catch (err) {
        console.error('Fetch teams with players error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).lean();
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(200).json(team);
    } catch (err) {
        console.error('Fetch team error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const patch = {};
        ['name', 'season', 'coach', 'logo', 'wins', 'losses', 'playerCount'].forEach((key) => {
            if (req.body[key] !== undefined) patch[key] = req.body[key];
        });

        const team = await Team.findByIdAndUpdate(req.params.id, patch, { new: true }).lean();
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.status(200).json({
            message: 'Team updated successfully',
            team,
        });
    } catch (err) {
        console.error('Update team error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (err) {
        console.error('Delete team error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
