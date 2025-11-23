// controller/LoginController.js
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../model/User');
const UserRole = require('../model/UserRole');

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body || {};
        email = (email || '').trim().toLowerCase();
        if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

        const user = await User.findOne({ email }).lean();
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

        // roles
        const rolesAgg = await UserRole.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(user._id) } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $project: { _id: 0, name: '$role.name' } }
        ]);
        const roles = rolesAgg.map(r => r.name);
        const isAdmin = roles.includes('admin');

        // session
        req.session.userId = String(user._id);
        req.session.username = user.username;
        req.session.isAdmin = isAdmin;

        req.session.save(err => {
            if(err){
                console.error('Session save error:', err);
                return res.status(500).json({message: 'Server error saving session'});
            }

        
            return res.json({
                message: 'Logged in.',
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                },
                roles,               // <— include roles array
                isAdmin         // <— include boolean
            });
        });
        } catch (err) {
            console.error('login error:', err);
            return res.status(500).json({ message: 'Server error.' });
        };
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out.' });
    });
};

exports.me = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Not logged in.' });

        const userId = new mongoose.Types.ObjectId(req.session.userId);
        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const rolesAgg = await UserRole.aggregate([
            { $match: { userId } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $project: { _id: 0, name: '$role.name' } }
        ]);
        const roles = rolesAgg.map(r => r.name);
        const isAdmin = roles.includes('admin');

        return res.json({
            id: user._id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            roles,
            isAdmin              // <— include boolean here too
        });
    } catch (err) {
        console.error('me error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};
