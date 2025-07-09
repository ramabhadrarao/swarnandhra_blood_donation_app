import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  weight: {
    type: Number,
    required: true,
    min: 50
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  medicalConditions: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    enum: ['always', 'monthly', 'emergency'],
    default: 'emergency'
  },
  documents: [{
    type: {
      type: String,
      enum: ['aadhar', 'blood_report', 'medical_record', 'donation_proof', 'other'],
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  totalDonations: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Donor', donorSchema);