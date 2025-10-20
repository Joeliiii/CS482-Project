// controller/UserController.js
const bcrypt = require('bcrypt');
const User = require('../model/User');

exports.updateMe = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Not logged in.' });

        const { username, phone, newPassword } = req.body || {};
        const update = {};

        if (typeof username === 'string' && username.trim()) update.username = username.trim();
        if (typeof phone === 'string') update.phone = phone.trim();

        if (typeof newPassword === 'string' && newPassword.length > 0) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters.' });
            }
            update.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        const user = await User.findByIdAndUpdate(req.session.userId, update, { new: true }).lean();
        if (!user) return res.status(404).json({ message: 'User not found.' });

        return res.json({
            message: 'Profile updated.',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                phone: user.phone,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('updateMe error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};
