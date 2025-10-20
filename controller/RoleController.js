// controller/RoleController.js
const mongoose = require('mongoose');
const Role = require('../model/Role');
const User = require('../model/User');
const UserRole = require('../model/UserRole');

exports.assignRole = async (req, res) => {
    try {
        const { userId, roleName } = req.body || {};
        if (!userId || !roleName) {
            return res.status(400).json({ message: 'userId and roleName are required.' });
        }

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const role = await Role.findOne({ name: roleName.toLowerCase() }).lean();
        if (!role) return res.status(404).json({ message: 'Role not found.' });

        await UserRole.updateOne(
            { userId: new mongoose.Types.ObjectId(user._id), roleId: role._id },
            { $setOnInsert: { userId: user._id, roleId: role._id } },
            { upsert: true }
        );

        return res.json({ message: `Role '${roleName}' assigned.` });
    } catch (e) {
        console.error('assignRole error:', e);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.revokeRole = async (req, res) => {
    try {
        const { userId, roleName } = req.body || {};
        if (!userId || !roleName) {
            return res.status(400).json({ message: 'userId and roleName are required.' });
        }

        const role = await Role.findOne({ name: roleName.toLowerCase() }).lean();
        if (!role) return res.status(404).json({ message: 'Role not found.' });

        const result = await UserRole.deleteOne({ userId, roleId: role._id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User did not have that role.' });
        }
        return res.json({ message: `Role '${roleName}' revoked.` });
    } catch (e) {
        console.error('revokeRole error:', e);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.listUserRoles = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ message: 'userId required.' });

        const roles = await UserRole.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
            { $unwind: '$role' },
            { $project: { _id: 0, name: '$role.name', displayName: '$role.displayName' } }
        ]);

        return res.json({ roles });
    } catch (e) {
        console.error('listUserRoles error:', e);
        return res.status(500).json({ message: 'Server error.' });
    }
};
