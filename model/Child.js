// model/Child.js
const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    birthdate: { type: Date, required: true },
    photoUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Child || mongoose.model('Child', childSchema);
