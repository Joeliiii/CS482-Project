// controller/SignupController.js
const bcrypt = require('bcrypt');
const User = require('../model/User');
const Role = require('../model/Role');
const UserRole = require('../model/UserRole');
const Adult = require('../model/Adult');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_TYPES = new Set(['passport', 'license', 'realid']);

exports.signup = async (req, res) => {
    try {
        let {
            email,
            username,
            password,
            phone,
            accountType,     // 'user' | 'adult'
            address,         // adult-only
            govIdType,       // adult-only: 'passport' | 'license' | 'realid'
            govIdLast4       // adult-only: '1234'
        } = req.body || {};

        // Normalize
        email = (email || '').trim().toLowerCase();
        username = (username || '').trim();
        phone = (phone || '').trim();
        accountType = (accountType || 'user').toLowerCase().trim();

        // Basic validation
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Email, username, and password are required.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }
        if (accountType !== 'user' && accountType !== 'adult') {
            return res.status(400).json({ message: 'Invalid account type.' });
        }

        // Adult-only validation
        if (accountType === 'adult') {
            if (!address || !govIdType || !govIdLast4) {
                return res.status(400).json({ message: 'Address, ID Type, and ID Last 4 are required for Adult accounts.' });
            }
            const idTypeNorm = (govIdType || '').toLowerCase().trim();
            if (!ID_TYPES.has(idTypeNorm)) {
                return res.status(400).json({ message: 'ID Type must be Passport, License, or REALID.' });
            }
            if (!/^\d{4}$/.test(String(govIdLast4))) {
                return res.status(400).json({ message: 'ID Last 4 must be exactly 4 digits.' });
            }
            govIdType = idTypeNorm; // normalize for storage
        }

        // Unique email
        const existing = await User.findOne({ email }).lean();
        if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

        // Create user
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, username, passwordHash, phone });

        // Ensure base "user" role exists, then link
        const userRole = await Role.findOneAndUpdate(
            { name: 'user' },
            { $setOnInsert: { name: 'user', displayName: 'User' } },
            { new: true, upsert: true }
        ).lean();

        await UserRole.updateOne(
            { userId: newUser._id, roleId: userRole._id },
            { $setOnInsert: { userId: newUser._id, roleId: userRole._id } },
            { upsert: true }
        );

        // If adult, ensure "adult" role and create Adult record
        if (accountType === 'adult') {
            const adultRole = await Role.findOneAndUpdate(
                { name: 'adult' },
                { $setOnInsert: { name: 'adult', displayName: 'Adult' } },
                { new: true, upsert: true }
            ).lean();

            await UserRole.updateOne(
                { userId: newUser._id, roleId: adultRole._id },
                { $setOnInsert: { userId: newUser._id, roleId: adultRole._id } },
                { upsert: true }
            );

            await Adult.updateOne(
                { userId: newUser._id },
                {
                    $setOnInsert: {
                        userId: newUser._id,
                        legalName: username, // or separate field if you later add one
                        address: address.trim(),
                        govIdType,
                        govIdLast4: String(govIdLast4),
                        photoUrl: ''
                    }
                },
                { upsert: true }
            );
        }

        console.log('✅ User created:', newUser.email, `(type: ${accountType})`);

        return res.status(201).json({
            message: 'Account created successfully!',
            userId: newUser._id
        });
    } catch (err) {
        console.error('❌ Signup error:', err);
        return res.status(500).json({ message: 'Error creating account.' });
    }
};
