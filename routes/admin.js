// routes/admin.js
const express = require('express');
const { requireRole } = require('../middleware/roles');
const Admin = require('../controller/AdminController');

const router = express.Router();

// protect all admin routes
router.use(requireRole('admin'));

// Users
router.get('/users', Admin.listUsers);
router.patch('/users/:userId', Admin.updateUser);
router.delete('/users/:userId', Admin.deleteUser);

// Roles
router.get('/users/:userId/roles', Admin.listUserRoles);
router.post('/roles/assign', Admin.assignRole);   // { userId, roleName }
router.post('/roles/revoke', Admin.revokeRole);   // { userId, roleName }

// Events
router.get('/events', Admin.listEvents);
router.post('/events', Admin.createEvent);
router.patch('/events/:eventId', Admin.updateEvent);
router.delete('/events/:eventId', Admin.deleteEvent);

// Matches
router.get('/matches', Admin.listMatches);                  // ?eventId=...
router.post('/matches', Admin.createMatch);
router.patch('/matches/:matchId', Admin.updateMatch);
router.delete('/matches/:matchId', Admin.deleteMatch);

module.exports = router;
