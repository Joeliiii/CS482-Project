// controller/AdminController.js
const mongoose = require('mongoose');

// Core models
const User = require('../model/User');
const UserRole = require('../model/UserRole');
const Role = require('../model/Role');

// Optional domain models (load defensively)
let Team = null;
let Event = null;
let Adult = null;
let Child = null;
let AdultChildLink = null;

try { Team = require('../model/Team'); } catch (_) {}
try { Event = require('../model/Event'); } catch (_) {}
try { Adult = require('../model/Adult'); } catch (_) {}
try { Child = require('../model/Child'); } catch (_) {}
try { AdultChildLink = require('../model/AdultChildLink'); } catch (_) {}

/* =========================================================
 * Overview
 * =======================================================*/
exports.overview = async (req, res) => {
    try {
        const [userCount, teamCount, eventCount] = await Promise.all([
            User.countDocuments(),
            Team ? Team.countDocuments() : Promise.resolve(0),
            Event ? Event.countDocuments() : Promise.resolve(0),
        ]);

        const recent = await User.find().sort({ createdAt: -1 }).limit(10).lean();
        const userIds = recent.map(u => new mongoose.Types.ObjectId(u._id));

        const links = await UserRole.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $project: { _id: 0, userId: 1, role: '$role.name' } }
        ]);

        const rolesByUser = links.reduce((m, r) => {
            const k = String(r.userId);
            (m[k] ||= []).push(r.role);
            return m;
        }, {});

        const users = recent.map(u => ({
            id: u._id,
            email: u.email,
            username: u.username,
            createdAt: u.createdAt,
            roles: rolesByUser[String(u._id)] || []
        }));

        res.json({ stats: { userCount, teamCount, eventCount }, users });
    } catch (e) {
        console.error('admin overview error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/* =========================================================
 * Users: list / update (profile fields) / update roles (batch) / delete
 * =======================================================*/
exports.listUsers = async (req, res) => {
    try {
        const { q = '', page = 1, limit = 20 } = req.query;
        const find = q
            ? {
                $or: [
                    { email:    { $regex: q, $options: 'i' } },
                    { username: { $regex: q, $options: 'i' } },
                    { phone:    { $regex: q, $options: 'i' } }
                ]
            }
            : {};

        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            User.find(find).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            User.countDocuments(find)
        ]);

        const pageUserIds = items.map(u => new mongoose.Types.ObjectId(u._id));
        const roleLinks = await UserRole.aggregate([
            { $match: { userId: { $in: pageUserIds } } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $project: { _id: 0, userId: 1, role: '$role.name' } }
        ]);

        const rolesByUser = roleLinks.reduce((m, r) => {
            const k = String(r.userId);
            (m[k] ||= []).push(r.role);
            return m;
        }, {});

        const itemsWithRoles = items.map(u => ({
            ...u,
            roles: rolesByUser[String(u._id)] || []
        }));

        res.json({ items: itemsWithRoles, total, page: Number(page), pages: Math.ceil(total/Number(limit)) });
    } catch (e) {
        console.error('listUsers error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update basic profile fields for a single user
// Body can contain: username, phone, isVerified
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const patch = {};
        ['username','phone','isVerified'].forEach(k => {
            if (req.body[k] !== undefined) patch[k] = req.body[k];
        });

        const updated = await User.findByIdAndUpdate(userId, patch, { new: true }).lean();
        if (!updated) return res.status(404).json({ message: 'User not found.' });
        res.json(updated);
    } catch (e) {
        console.error('updateUser error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Replace (batch) a user's roles with a provided set
// Body: { roles: ['admin','user'] }
exports.updateUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        let { roles } = req.body;
        if (!Array.isArray(roles)) roles = [];

        const uid = new mongoose.Types.ObjectId(userId);

        // Upsert target roles
        const roleDocs = [];
        for (const raw of roles) {
            const name = String(raw || '').toLowerCase().trim();
            if (!name) continue;
            const r = await Role.findOneAndUpdate(
                { name },
                { $setOnInsert: { name, displayName: name } },
                { new: true, upsert: true }
            ).lean();
            roleDocs.push(r);
        }

        // Compute diff vs existing
        const existing = await UserRole.find({ userId: uid }).lean();
        const existingIds = new Set(existing.map(x => String(x.roleId)));
        const desiredIds  = new Set(roleDocs.map(x => String(x._id)));

        const toAdd    = [...desiredIds].filter(id => !existingIds.has(id));
        const toRemove = [...existingIds].filter(id => !desiredIds.has(id));

        if (toAdd.length) {
            await UserRole.insertMany(toAdd.map(rid => ({ userId: uid, roleId: new mongoose.Types.ObjectId(rid) })));
        }
        if (toRemove.length) {
            await UserRole.deleteMany({ userId: uid, roleId: { $in: toRemove.map(id => new mongoose.Types.ObjectId(id)) } });
        }

        // Return fresh names
        const fresh = await UserRole.aggregate([
            { $match: { userId: uid } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $replaceWith: '$role' },
            { $project: { _id: 1, name: 1, displayName: 1 } }
        ]);

        res.json({ message: 'Roles updated.', roles: fresh.map(r => r.name) });
    } catch (e) {
        console.error('updateUserRoles error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete user + detach roles (+ optional cascades)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const uid = new mongoose.Types.ObjectId(userId);

        await Promise.all([
            User.deleteOne({ _id: uid }),
            UserRole.deleteMany({ userId: uid }),
            Adult ? Adult.deleteOne({ userId: uid }) : Promise.resolve(),
            AdultChildLink ? AdultChildLink.deleteMany({ adultId: uid }) : Promise.resolve()
        ]);

        res.status(200).json({ message: 'User deleted.' });
    } catch (e) {
        console.error('deleteUser error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/* =========================================================
 * Roles helpers on a single user (list / assign / revoke)
 * =======================================================*/
exports.listUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        const uid = new mongoose.Types.ObjectId(userId);

        const rows = await UserRole.aggregate([
            { $match: { userId: uid } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $replaceWith: '$role' },
            { $project: { _id: 1, name: 1, displayName: 1 } }
        ]);

        res.json(rows);
    } catch (e) {
        console.error('listUserRoles error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Body: { userId, roleName }
exports.assignRole = async (req, res) => {
    try {
        const { userId, roleName } = req.body;
        if (!userId || !roleName) return res.status(400).json({ message: 'userId and roleName required.' });

        const name = String(roleName).toLowerCase().trim();
        const role = await Role.findOneAndUpdate(
            { name },
            { $setOnInsert: { name, displayName: roleName } },
            { new: true, upsert: true }
        ).lean();

        await UserRole.updateOne(
            { userId: new mongoose.Types.ObjectId(userId), roleId: role._id },
            { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), roleId: role._id } },
            { upsert: true }
        );

        res.json({ message: `Assigned ${role.name}`, role });
    } catch (e) {
        console.error('assignRole error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Body: { userId, roleName }
exports.revokeRole = async (req, res) => {
    try {
        const { userId, roleName } = req.body;
        if (!userId || !roleName) return res.status(400).json({ message: 'userId and roleName required.' });

        const name = String(roleName).toLowerCase().trim();
        const role = await Role.findOne({ name }).lean();
        if (!role) return res.status(404).json({ message: 'Role not found.' });

        await UserRole.deleteOne({
            userId: new mongoose.Types.ObjectId(userId),
            roleId: role._id
        });

        res.status(200).json({ message: `Revoked ${role.name}` });
    } catch (e) {
        console.error('revokeRole error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/* =========================================================
 * Children by User (for admin view)
 * =======================================================*/
exports.listChildren = async (req, res) => {
    try {
        if (!Adult || !Child || !AdultChildLink) {
            return res.json({ items: [] });
        }
        const { userId } = req.params;
        const uid = new mongoose.Types.ObjectId(userId);

        const adult = await Adult.findOne({ userId: uid }).lean();
        if (!adult) return res.json({ items: [] });

        const links = await AdultChildLink.find({ adultId: adult._id }).lean();
        const childIds = links.map(l => l.childId);
        const children = childIds.length ? await Child.find({ _id: { $in: childIds } }).lean() : [];

        res.json({ items: children.map(c => ({
                id: c._id,
                fullName: c.fullName,
                birthdate: c.birthdate,
                photoUrl: c.photoUrl || ''
            }))});
    } catch (e) {
        console.error('listChildren error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/* =========================================================
 * Teams CRUD (admin)
 * =======================================================*/
exports.listTeams = async (req, res) => {
    try {
        if (!Team) return res.json({ items: [], total: 0, page: 1, pages: 1 });

        const { q = '', season = '', page = 1, limit = 20 } = req.query;
        const find = {};
        if (q)      find.name   = { $regex: q, $options: 'i' };
        if (season) find.season = String(season);

        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            Team.find(find).sort({ created_at: -1 }).skip(skip).limit(Number(limit)).lean(),
            Team.countDocuments(find)
        ]);

        res.json({ items, total, page: Number(page), pages: Math.ceil(total/Number(limit)) });
    } catch (e) {
        console.error('listTeams error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.createTeam = async (req, res) => {
    try {
        if (!Team) return res.status(500).json({ message: 'Team model not installed.' });

        const { name, season, coach = '', logo = '' } = req.body;
        if (!name || !season) return res.status(400).json({ message: 'name and season required.' });
        if (!/^\d{4}$/.test(String(season))) return res.status(400).json({ message: 'season must be YYYY.' });

        const team = await Team.create({ name: name.trim(), season: String(season), coach, logo });
        res.status(201).json(team);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ message: 'Team already exists for this season.' });
        console.error('createTeam error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        if (!Team) return res.status(500).json({ message: 'Team model not installed.' });

        const { teamId } = req.params;
        const patch = {};
        ['name','season','coach','logo','wins','losses','playerCount'].forEach(k => {
            if (req.body[k] !== undefined) patch[k] = req.body[k];
        });
        const t = await Team.findByIdAndUpdate(teamId, patch, { new: true }).lean();
        if (!t) return res.status(404).json({ message: 'Team not found.' });
        res.json(t);
    } catch (e) {
        console.error('updateTeam error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        if (!Team) return res.status(500).json({ message: 'Team model not installed.' });

        const { teamId } = req.params;
        const t = await Team.findByIdAndDelete(teamId);
        if (!t) return res.status(404).json({ message: 'Team not found.' });

        res.status(200).json({ message: 'Team deleted.' });
    } catch (e) {
        console.error('deleteTeam error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

/* =========================================================
 * Events CRUD (admin)
 * =======================================================*/
exports.listEvents = async (req, res) => {
    try {
        if (!Event) return res.json({ items: [], total: 0, page: 1, pages: 1 });

        const { from, to, page = 1, limit = 50 } = req.query;
        const find = {};
        if (from || to) find.start = {};
        if (from) find.start.$gte = new Date(from);
        if (to)   find.start.$lte = new Date(to);

        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            Event.find(find).sort({ start: 1 }).skip(skip).limit(Number(limit)).lean(),
            Event.countDocuments(find),
        ]);
        res.json({ items, total, page: Number(page), pages: Math.ceil(total/Number(limit)) });
    } catch (e) {
        console.error('listEvents error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        if (!Event) return res.status(500).json({ message: 'Event model not installed.' });

        const { title, description = '', location = '', start, end } = req.body;
        if (!title || !start || !end) return res.status(400).json({ message: 'title, start, end required.' });

        const ev = await Event.create({ title, description, location, start, end });
        res.status(201).json(ev);
    } catch (e) {
        console.error('createEvent error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        if (!Event) return res.status(500).json({ message: 'Event model not installed.' });

        const { eventId } = req.params;
        const patch = {};
        ['title','description','location','start','end'].forEach(k => {
            if (req.body[k] !== undefined) patch[k] = req.body[k];
        });
        const ev = await Event.findByIdAndUpdate(eventId, patch, { new: true }).lean();
        if (!ev) return res.status(404).json({ message: 'Event not found.' });
        res.json(ev);
    } catch (e) {
        console.error('updateEvent error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        if (!Event) return res.status(500).json({ message: 'Event model not installed.' });

        const { eventId } = req.params;
        await Event.deleteOne({ _id: eventId });
        res.status(200).json({ message: 'Event deleted.' });
    } catch (e) {
        console.error('deleteEvent error:', e);
        res.status(500).json({ message: 'Server error.' });
    }
};
