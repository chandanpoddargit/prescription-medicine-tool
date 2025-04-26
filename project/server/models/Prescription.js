import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicines: [
    {
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
      },
      dosage: {
        type: String,
        required: true
      },
      frequency: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        required: true
      }
    }
  ],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['created', 'dispensed', 'completed'],
    default: 'created'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
PrescriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);

export default Prescription;