/**
 * Author: Nishant Gurung
 * User Story S20 - Admin Support Messages
 * API routes for support ticket management
 */
const express = require('express');
const router = express.Router();
const supportMessageModel = require('../model/supportMessage.js');

// Create new support ticket (public - anyone can submit)
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message, category } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'Name, email, subject, and message are required' 
            });
        }

        // email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const ticket = await supportMessageModel.create({ 
            name, 
            email, 
            subject, 
            message,
            category: category || 'general'
        });

        res.status(201).json({
            message: 'Support ticket created successfully',
            id: ticket._id,
            ticketNumber: ticket._id.toString().slice(-8).toUpperCase()
        });
    } catch (err) {
        console.error('Support ticket creation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// get all support messages (admin only)
router.get('/', async (req, res) => {
    try {
        const messages = await supportMessageModel.readAll();
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fetch support messages error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// get unresolved messages (admin dashboard)
router.get('/unresolved', async (req, res) => {
    try {
        const messages = await supportMessageModel.readUnresolved();
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fetch unresolved messages error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// get messages by status
router.get('/status/:status', async (req, res) => {
    try {
        const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
        if (!validStatuses.includes(req.params.status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const messages = await supportMessageModel.readByStatus(req.params.status);
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fetch messages by status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// messages by priority
router.get('/priority/:priority', async (req, res) => {
    try {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(req.params.priority)) {
            return res.status(400).json({ error: 'Invalid priority' });
        }

        const messages = await supportMessageModel.readByPriority(req.params.priority);
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fetch messages by priority error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// messages assigned to admin
router.get('/assigned/:adminUsername', async (req, res) => {
    try {
        const messages = await supportMessageModel.readByAssignee(req.params.adminUsername);
        res.status(200).json(messages);
    } catch (err) {
        console.error('Fetch assigned messages error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// single message by ID
router.get('/:id', async (req, res) => {
    try {
        const message = await supportMessageModel.readOne(req.params.id);

        if (!message) {
            return res.status(404).json({ error: 'Support message not found' });
        }

        res.status(200).json(message);
    } catch (err) {
        console.error('Fetch support message error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// update message status/priority (admin only)
router.patch('/:id', async (req, res) => {
    try {
        const { status, priority, assignedTo, adminNotes } = req.body;

        // Validate status if provided
        if (status) {
            const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
        }

        // Validate priority if provided
        if (priority) {
            const validPriorities = ['low', 'medium', 'high', 'urgent'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ error: 'Invalid priority' });
            }
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        const message = await supportMessageModel.update(req.params.id, updateData);

        if (!message) {
            return res.status(404).json({ error: 'Support message not found' });
        }

        res.status(200).json({
            message: 'Support ticket updated successfully',
            data: message
        });
    } catch (err) {
        console.error('Update support message error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// delete message (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const message = await supportMessageModel.deleteOne(req.params.id);

        if (!message) {
            return res.status(404).json({ error: 'Support message not found' });
        }

        res.status(200).json({ message: 'Support ticket deleted successfully' });
    } catch (err) {
        console.error('Delete support message error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;