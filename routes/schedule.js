// routes/team.js

const express = require('express');
const router = express.Router();
const scheduleModel = require('../model/schedule.js'); // Mongoose schedule model

router.post('/', async (req, res) => {
    try {
        const { date, time, homeTeam, awayTeam, venue, season } = req.body;

        if (!date || !time || !homeTeam || !awayTeam || !venue || !season) {
            return res.status(400).json({ error: 'Date, time, teams, venue, and season are required' });
        }
        // validating date format
        const gameDate = new Date(date);
        if (isNaN(gameDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // validating that teams are different
        if (homeTeam === awayTeam) {
            return res.status(400).json({ 
                error: 'Home and away teams must be different' 
            });
        }

        const schedule = await scheduleModel.create({ 
            date: gameDate, 
            time, 
            homeTeam, 
            awayTeam, 
            venue, 
            season 
        });

        res.status(201).json({
            message: 'Event scheduled successfully',
            id: schedule._id
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ 
                error: 'Event already exists for these teams on this date' 
            });
        }
        console.error('Schedule creation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// all scheduled events
router.get('/', async (req, res) => {
    try {
        const schedules = await scheduleModel.readAll();
        res.status(200).json(schedules);
    } catch (err) {
        console.error('Fetch schedules error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// upcoming events
router.get('/upcoming', async (req, res) => {
    try {
        const schedules = await scheduleModel.readUpcoming();
        res.status(200).json(schedules);
    } catch (err) {
        console.error('Fetch upcoming schedules error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// events by season
router.get('/season/:season', async (req, res) => {
    try {
        const schedules = await scheduleModel.readBySeason(req.params.season);
        res.status(200).json(schedules);
    } catch (err) {
        console.error('Fetch schedules by season error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// events by team
router.get('/team/:teamName', async (req, res) => {
    try {
        const schedules = await scheduleModel.readByTeam(req.params.teamName);
        res.status(200).json(schedules);
    } catch (err) {
        console.error('Fetch schedules by team error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// single event by ID
router.get('/:id', async (req, res) => {
    try {
        const schedule = await scheduleModel.readOne(req.params.id);

        if (!schedule) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json(schedule);
    } catch (err) {
        console.error('Fetch schedule error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// update event
router.patch('/:id', async (req, res) => {
    try {
        const schedule = await scheduleModel.update(req.params.id, req.body);

        if (!schedule) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({
            message: 'Event updated successfully',
            data: schedule
        });
    } catch (err) {
        console.error('Update schedule error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// delete event
router.delete('/:id', async (req, res) => {
    try {
        const schedule = await scheduleModel.deleteOne(req.params.id);

        if (!schedule) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Delete schedule error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;