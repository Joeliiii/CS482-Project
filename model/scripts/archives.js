// model/Archive.js
const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, 
  description: { type: String, required: true, trim: true },
  gameDate: { type: Date, required: true }, 
  thumbnailUrl: { type: String, trim: true }, 
  videoUrl: { type: String, required: true, trim: true }, 
  duration: { type: Number, required: true, min: 0 }, 
  views: { type: Number, default: 0, min: 0 }, 
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  status: { type: String, required: true, enum: ['processing', 'active', 'archived', 'deleted'], default: 'processing', lowercase: true },
  gameId: { type: String, trim: true }, 
  teams: [{ type: String, trim: true }],
  tags: [{ type: String, lowercase: true, trim: true }], 
  featured: { type: Boolean, default: false } 
}, { timestamps: true });

archiveSchema.index({ gameDate: -1 }); // for sorting by recent
archiveSchema.index({ views: -1 }); // for sorting by popularity
archiveSchema.index({ status: 1, featured: 1 }); // for featured active videos
archiveSchema.index({ tags: 1 }); // for tag-based filtering
archiveSchema.index({ teams: 1 }); // for team-based filtering 

// to increment view count
archiveSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.models.Archive || mongoose.model('Archive', archiveSchema);