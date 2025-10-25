// controller/ChildrenController.js
const mongoose = require('mongoose');
const Adult = require('../model/Adult');
const Child = require('../model/Child');
const AdultChildLink = require('../model/AdultChildLink');

exports.listMine = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Not logged in.' });

        const adult = await Adult.findOne({ userId: req.session.userId }).lean();
        if (!adult) return res.json({ children: [] });

        const links = await AdultChildLink.aggregate([
            { $match: { adultId: new mongoose.Types.ObjectId(adult._id) } },
            { $lookup: { from: 'children', localField: 'childId', foreignField: '_id', as: 'child' } },
            { $unwind: '$child' },
            { $project: {
                    _id: 0,
                    childId: '$child._id',
                    fullName: '$child.fullName',
                    birthdate: '$child.birthdate',
                    photoUrl: '$child.photoUrl',
                    relation: '$relation',
                    isPrimary: '$isPrimary'
                }
            }
        ]);

        return res.json({ children: links });
    } catch (e) {
        console.error('listMine error:', e);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.createMine = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Not logged in.' });

        const { fullName, birthdate, photoUrl, relation, isPrimary } = req.body || {};
        if (!fullName || !birthdate || !relation) {
            return res.status(400).json({ message: 'fullName, birthdate, and relation are required.' });
        }

        const adult = await Adult.findOne({ userId: req.session.userId });
        if (!adult) {
            return res.status(400).json({ message: 'Adult record not found for this account.' });
        }

        const child = await Child.create({
            fullName: fullName.trim(),
            birthdate: new Date(birthdate),
            photoUrl: (photoUrl || '').trim()
        });

        await AdultChildLink.create({
            adultId: adult._id,
            childId: child._id,
            relation: relation.trim(),
            isPrimary: !!isPrimary
        });

        return res.status(201).json({
            message: 'Child added.',
            child: {
                childId: child._id,
                fullName: child.fullName,
                birthdate: child.birthdate,
                photoUrl: child.photoUrl,
                relation,
                isPrimary: !!isPrimary
            }
        });
    } catch (e) {
        console.error('createMine error:', e);
        return res.status(500).json({ message: 'Server error.' });
    }
};

exports.deleteMine = async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).json({ message: 'Not logged in.' });

        const { childId } = req.params;
        if (!childId) return res.status(400).json({ message: 'childId required' });

        const adult = await Adult.findOne({ userId: req.session.userId }).lean();
        if (!adult) return res.status(404).json({ message: 'Adult not found.' });

        // remove link (do not auto-delete child to avoid orphaning if linked elsewhere)
        const result = await AdultChildLink.deleteOne({ adultId: adult._id, childId: new mongoose.Types.ObjectId(childId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Link not found.' });
        }

        return res.json({ message: 'Child unlinked.' });
    } catch (e) {
        console.error('deleteMine error:', e);
        return res.status(500).json({ message: 'Server error.' });
    }
};
