import { Router } from 'express';
import { listDocuments, uploadDocuments } from '../controllers/document.controller.js';
import { listPatients } from '../controllers/patient.controller.js';
import { receiveFiles } from '../middleware/upload.middleware.js';

export const patientRouter = Router();

patientRouter.get('/', listPatients);
patientRouter.get('/:id/documents', listDocuments);
patientRouter.post('/:id/documents', receiveFiles, uploadDocuments);
