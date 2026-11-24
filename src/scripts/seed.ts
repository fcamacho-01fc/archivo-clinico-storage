import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { Patient } from '../models/patient.model.js';

const patients = [
  { recordNumber: 'EXP-001', displayName: 'Paciente ficticio A', medicalArea: 'Medicina general' },
  { recordNumber: 'EXP-002', displayName: 'Paciente ficticio B', medicalArea: 'Pediatría' },
  { recordNumber: 'EXP-003', displayName: 'Paciente ficticio C', medicalArea: 'Traumatología' },
];

async function seed() {
  await connectDatabase();
  await Patient.init();

  for (const patient of patients) {
    await Patient.updateOne(
      { recordNumber: patient.recordNumber },
      { $set: patient },
      { upsert: true, runValidators: true },
    );
  }

  console.log('Los tres expedientes ficticios están disponibles.');
}

seed()
  .catch((error: unknown) => {
    console.error('No se pudo cargar el seed.', error instanceof Error ? error.name : '');
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
