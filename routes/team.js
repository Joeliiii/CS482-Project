/**
 * Author: Nishant Gurung
 * User Story S9
 */
const express = require('express');
const router = express.Router();
const teamModel = require('../model/team.js');

// Create team
router.post('/', async (req, res) => {
    try {
        const { name, season, coach, logo } = req.body;

        if (!name || !season) {
            return res.status(400).json({ error: 'Team name and Season are required' });
        }
        if (!/^\d{4}$/.test(season)) {
            return res.status(400).json({ error: 'Invalid season format (use YYYY)' });
        }

        const team = await teamModel.create({ name, season, coach, logo });
        res.status(201).json({ message: 'Team created successfully!', id: team._id });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ error: 'Team already exists in this season' });
        }
        console.error('Team creation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all teams
router.get('/', async (_req, res) => {
    try {
        const teams = await teamModel.readAll();
        res.status(200).json(teams);
    } catch (err) {
        console.error('Fetch teams error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get teams by season (e.g., /api/teams/season/2025)
router.get('/season/:season', async (req, res) => {
    try {
        const { season } = req.params;
        const teams = await teamModel.readBySeason(season);
        res.status(200).json(teams);
    } catch (err) {
        console.error('Fetch teams by season error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a team by name (first match)
router.get('/by-name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const team = await teamModel.readByName(name);
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.status(200).json(team);
    } catch (err) {
        console.error('Fetch team by name error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get team by ID (place AFTER more specific routes)
router.get('/:id', async (req, res) => {
    try {
        const team = await teamModel.readOne(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.status(200).json(team);
    } catch (err) {
        console.error('Fetch team by id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update team fields (partial)
router.patch('/:id', async (req, res) => {
    try {
        const team = await teamModel.update(req.params.id, req.body);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        res.status(200).json({
            message: 'Team updated successfully',
            data: team
        });
    } catch (err) {
        // handle unique index violation on (name, season)
        if (err && err.code === 11000) {
            return res.status(409).json({ error: 'Another team with this name already exists in this season' });
        }
        console.error('Update team error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update team logo ONLY (separate route so it doesn’t shadow the general patch)
router.patch('/:id/logo', async (req, res) => {
    try {
        const { logo } = req.body;
        if (!logo) return res.status(400).json({ error: 'logo is required' });

        const team = await teamModel.update(req.params.id, { logo });
        if (!team) return res.status(404).json({ error: 'Team not found' });

        res.status(200).json({
            message: 'Logo updated successfully',
            data: team
        });
    } catch (err) {
        console.error('Update logo error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete team by ID
router.delete('/:id', async (req, res) => {
    try {
        const team = await teamModel.deleteOne(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });

        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (err) {
        console.error('Delete team error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
