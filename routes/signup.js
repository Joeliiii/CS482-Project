const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const router = express.Router();

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    display_name: { type: String, required: true },
    password_hash: { type: String, required: true },
    phone: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

router.post('/', async (req, res) => {
    try {
        const { email, username, password, phone } = req.body;
        if (!email || !username || !password || !phone) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ email, display_name: username, password_hash: hash, phone });
        await user.save();

        res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
