// controller/SignupController.js
const bcrypt = require('bcrypt');
const User = require('../model/User'); // import the model

exports.signup = async (req, res) => {
    try {
        const { email, username, password, phone } = req.body;

        // ✅ Basic validation
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Email, username, and password are required.' });
        }

        // ✅ Check for existing user by email
        const existing = await User.findOne({ email });
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

        console.log('✅ User created:', newUser.email);

        return res.status(201).json({
            message: 'Account created successfully!',
            userId: newUser._id
        });
    } catch (err) {
        console.error('❌ Signup error:', err);
        return res.status(500).json({ message: 'Error creating account.' });
    }
};
