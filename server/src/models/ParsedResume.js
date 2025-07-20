import mongoose from 'mongoose';

const parsedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  extractedFields: {
    skills: [{
      type: String,
      trim: true
    }],
    education: [{
      degree: String,
      institution: String,
      year: Number,
      gpa: Number
    }],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
      startDate: Date,
      endDate: Date
    }],
    contact: {
      phone: String,
      address: String,
      linkedin: String
    },
    summary: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  parsedAt: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'doc']
  }
});

parsedResumeSchema.index({ userId: 1 });
parsedResumeSchema.index({ 'extractedFields.skills': 1 });

export default mongoose.model('ParsedResume', parsedResumeSchema); 