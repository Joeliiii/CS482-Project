// controller/SignupController.js
const bcrypt = require('bcrypt');
const User = require('../model/User');
const Role = require('../model/Role');
const UserRole = require('../model/UserRole');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = async (req, res) => {
    try {
        let { email, username, password, phone } = req.body || {};

        // Normalize inputs
        email = (email || '').trim().toLowerCase();
        username = (username || '').trim();
        phone = (phone || '').trim();

        // ✅ Basic validation
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Email, username, and password are required.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // ✅ Check for existing user by email
        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // ✅ Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // ✅ Create user in database
        const newUser = await User.create({
            email,
            username,
            passwordHash,
            phone
        });

        // ✅ OPTIONAL: Assign default "user" role on signup (if role exists)
        try {
            const baseUserRole = await Role.findOne({ name: 'user' }).lean();
            if (baseUserRole) {
                await UserRole.updateOne(
                    { userId: newUser._id, roleId: baseUserRole._id },
                    { $setOnInsert: { userId: newUser._id, roleId: baseUserRole._id } },
                    { upsert: true }
                );
            }
        } catch (roleErr) {
            // Do not fail signup if role linking errors; just log
            console.warn('Signup: default role link failed:', roleErr?.message || roleErr);
        }

        console.log('✅ User created:', newUser.email);

        // OPTIONAL: auto-login after signup
        // req.session.userId = String(newUser._id);

        return res.status(201).json({
            message: 'Account created successfully!',
            userId: newUser._id
        });
    } catch (err) {
        console.error('❌ Signup error:', err);
        return res.status(500).json({ message: 'Error creating account.' });
    }
};
