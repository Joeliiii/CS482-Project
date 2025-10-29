// model/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  gameId: { type: String, required: true, trim: true }, // e.g. 'game1', 'game2'
  gameName: { type: String, required: true, trim: true }, // e.g. 'Hawks vs Eagles - Saturday, Nov 2 @ 10:00 AM'
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketType: { type: String, required: true, enum: ['adult', 'child'], lowercase: true }, // ticket type
  quantity: { type: Number, required: true, min: 1 },
  pricePerTicket: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, default: Date.now },
  status: { type: String, required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending', lowercase: true }
}, { timestamps: true });

ticketSchema.index({ userId: 1, purchaseDate: -1 });
ticketSchema.index({ gameId: 1, status: 1 });

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);