import type { Request, Response } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { Patient } from '../models/patient.model.js';
import { HttpError } from '../middleware/error.middleware.js';

export async function listPatients(_request: Request, response: Response) {
  const patients = await Patient.find().sort({ recordNumber: 1 }).lean();
  response.json({ data: patients });
}

export async function requirePatient(id: string) {
  if (!isObjectIdOrHexString(id)) {
    throw new HttpError(400, 'INVALID_PATIENT_ID', 'El ID del expediente es inválido.');
  }

  if (!(await Patient.exists({ _id: id }))) {
    throw new HttpError(404, 'PATIENT_NOT_FOUND', 'El expediente no existe.');
  }
}
