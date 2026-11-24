import { Router } from 'express';
import { deleteDocument, downloadDocument, getDocumentUrl } from '../controllers/document.controller.js';

export const documentRouter = Router();

documentRouter.get('/:id/url', getDocumentUrl);
documentRouter.get('/:id/download', downloadDocument);
documentRouter.delete('/:id', deleteDocument);
