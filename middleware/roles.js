// middleware/roles.js
const mongoose = require('mongoose');
const UserRole = require('../model/UserRole');
const Role = require('../model/Role');

exports.requireRole = (roleName) => {
    return async (req, res, next) => {
        try {
            if (!req.session?.userId) return res.status(401).json({ message: 'Not logged in.' });

            const role = await Role.findOne({ name: roleName.toLowerCase() }).lean();
            if (!role) return res.status(500).json({ message: `Role '${roleName}' not configured.` });

            const has = await UserRole.findOne({
                userId: new mongoose.Types.ObjectId(req.session.userId),
                roleId: role._id
            }).lean();

            if (!has) return res.status(403).json({ message: 'Forbidden.' });

            next();
        } catch (e) {
            console.error('requireRole error:', e);
            return res.status(500).json({ message: 'Server error.' });
        }
    };
};
