/**
 * Author: Nishant Gurung
 * User Story S20 - Admin Support Messages
 * Model for managing support tickets/messages
 */
const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        default: 'new',
        enum: ['new', 'in-progress', 'resolved', 'closed']
    },
    priority: {
        type: String,
        default: 'medium',
        enum: ['low', 'medium', 'high', 'urgent']
    },
    assignedTo: {
        type: String,
        default: null  // Admin username who's handling it
    },
    category: {
        type: String,
        default: 'general',
        enum: ['general', 'technical', 'billing', 'account', 'other']
    },
    adminNotes: {
        type: String,
        default: ''
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    resolved_at: {
        type: Date,
        default: null
    }
});

// index for efficient queries
SupportMessageSchema.index({ status: 1, priority: 1 });
SupportMessageSchema.index({ email: 1 });
SupportMessageSchema.index({ created_at: -1 });

const supportMessageModel = mongoose.models.SupportMessage || 
    mongoose.model('supportMessage', SupportMessageSchema);

// create new support ticket
exports.create = async function(messageData) {
    let message = new supportMessageModel(messageData);
    await message.save();
    return message;
};

// get all support messages
exports.readAll = async function() {
    return await supportMessageModel.find({}).sort({ created_at: -1 });
};

// get one message by ID
exports.readOne = async function(id) {
    return await supportMessageModel.findById(id);
};

// get messages by status
exports.readByStatus = async function(status) {
    return await supportMessageModel.find({ status: status }).sort({ created_at: -1 });
};

// get messages by priority
exports.readByPriority = async function(priority) {
    return await supportMessageModel.find({ priority: priority }).sort({ created_at: -1 });
};

// get unresolved messages (for admin dashboard)
exports.readUnresolved = async function() {
    return await supportMessageModel.find({
        status: { $in: ['new', 'in-progress'] }
    }).sort({ priority: -1, created_at: -1 });
};

// get messages assigned to admin
exports.readByAssignee = async function(adminUsername) {
    return await supportMessageModel.find({ 
        assignedTo: adminUsername 
    }).sort({ created_at: -1 });
};

// update message (status, priority, notes, etc.)
exports.update = async function(id, updateData) {
    updateData.updated_at = Date.now();
    
    // If status changed to resolved/closed, set resolved_at
    if (['resolved', 'closed'].includes(updateData.status)) {
        updateData.resolved_at = Date.now();
    }
    
    let message = await supportMessageModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );
    return message;
};

// delete message
exports.deleteOne = async function(id) {
    let message = await supportMessageModel.findByIdAndDelete(id);
    return message;
};

// delete all (for testing only)
exports.deleteAll = async function() {
    await supportMessageModel.deleteMany();
};