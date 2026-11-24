import { model, Schema } from 'mongoose';

const patientSchema = new Schema({
  recordNumber: { type: String, required: true, trim: true, unique: true },
  displayName: { type: String, required: true, trim: true },
  medicalArea: { type: String, required: true, trim: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
});

export const Patient = model('Patient', patientSchema);
