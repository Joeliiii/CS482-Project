// controller/RoleController.js
const mongoose = require('mongoose');
const User = require('../model/User');
const Role = require('../model/Role');
const UserRole = require('../model/UserRole');

exports.assignRole = async (req, res) => {
    try {
        const { userId, roleName } = req.body;

        if (!userId || !roleName) {
            return res.status(400).json({ message: 'Missing userId or roleName.' });
        }

        // Validate user and role existence
        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const role = await Role.findOne({ name: roleName.toLowerCase() }).lean();
        if (!role) return res.status(404).json({ message: 'Role not found.' });

        // Link user and role (upsert)
        await UserRole.updateOne(
            {
                userId: new mongoose.Types.ObjectId(userId),
                roleId: role._id,
            },
            { $setOnInsert: { userId, roleId: role._id } },
            { upsert: true }
        );

        return res.status(200).json({
            message: `✅ Role '${roleName}' assigned to ${user.email}.`,
        });
    } catch (err) {
        console.error('assignRole error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.revokeRole = async (req, res) => {
    try {
        const { userId, roleName } = req.body;

        if (!userId || !roleName) {
            return res.status(400).json({ message: 'Missing userId or roleName.' });
        }

        const role = await Role.findOne({ name: roleName.toLowerCase() }).lean();
        if (!role) return res.status(404).json({ message: 'Role not found.' });

        const result = await UserRole.deleteOne({
            userId: new mongoose.Types.ObjectId(userId),
            roleId: role._id,
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Role link not found.' });
        }

        // ✅ Explicitly set 200 for test consistency
        return res.status(200).json({ message: `✅ Role '${roleName}' revoked.` });
    } catch (err) {
        console.error('revokeRole error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.listUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'Missing userId param.' });
        }

        // Aggregate roles joined from Role collection
        const roles = await UserRole.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roleId',
                    foreignField: '_id',
                    as: 'role',
                },
            },
            { $unwind: '$role' },
            {
                $project: {
                    _id: 0,
                    name: '$role.name',
                    displayName: '$role.displayName',
                },
            },
        ]);

        return res.status(200).json({ userId, roles });
    } catch (err) {
        console.error('listUserRoles error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
};
