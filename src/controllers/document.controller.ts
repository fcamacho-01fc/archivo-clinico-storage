import type { Request, Response } from 'express';
import { isObjectIdOrHexString } from 'mongoose';
import { HttpError } from '../middleware/error.middleware.js';
import { Document, documentTypes } from '../models/document.model.js';
import { requirePatient } from './patient.controller.js';

export async function listDocuments(request: Request<{ id: string }>, response: Response) {
  const { id } = request.params;
  await requirePatient(id);

  // TODO 03 (Guiado). Consulta el modelo Document por el ID del expediente.
  // Devuelve 200 con { data } y los metadatos y URLs guardados en MongoDB.
  throw new HttpError(501, 'NOT_IMPLEMENTED', 'La consulta de documentos está pendiente.');
}

export async function uploadDocuments(request: Request<{ id: string }>, response: Response) {
  const files = request.files as Express.Multer.File[] | undefined;
  if (!files?.length || files.some((file) => file.size === 0)) {
    throw new HttpError(400, 'NO_FILES', 'Selecciona de una a tres imágenes con contenido.');
  }

  const documentType: unknown = request.body?.documentType;
  if (typeof documentType !== 'string' || !documentTypes.includes(documentType)) {
    throw new HttpError(400, 'INVALID_DOCUMENT_TYPE', 'Selecciona un tipo de documento válido.');
  }

  const patientId = request.params.id;
  await requirePatient(patientId);

  // TODO 04 (Guiado). Usa getCloudinary de src/config/cloudinary.ts para subir cada buffer de request.files.
  // Guarda el public_id, la secure_url y los metadatos de cada archivo con patientId y documentType.
  // Devuelve 201 con { data } y los documentos creados. Si falla el lote, intenta limpiar lo que ya se creó.
  throw new HttpError(501, 'NOT_IMPLEMENTED', 'La carga de documentos está pendiente.');
}

export async function getDocumentUrl(request: Request<{ id: string }>, response: Response) {
  const document = await requireDocument(request.params.id);
  response.json({ data: { url: document.cloudinaryUrl } });
}

export async function downloadDocument(request: Request<{ id: string }>, response: Response) {
  // TODO 05 (Individual). El navegador debe guardar el documento como archivo. Informa si no existe.
  throw new HttpError(501, 'NOT_IMPLEMENTED', 'La descarga de documentos está pendiente.');
}

export async function deleteDocument(request: Request<{ id: string }>, response: Response) {
  // TODO 06 (Individual). Elimina la imagen y sus metadatos.
  // Cloudinary y MongoDB son independientes. Si falla una operación, devuelve un error.
  throw new HttpError(501, 'NOT_IMPLEMENTED', 'La eliminación de documentos está pendiente.');
}

async function requireDocument(id: string) {
  if (!isObjectIdOrHexString(id)) {
    throw new HttpError(400, 'INVALID_DOCUMENT_ID', 'El ID del documento es inválido.');
  }

  const document = await Document.findById(id).lean();
  if (!document) {
    throw new HttpError(404, 'DOCUMENT_NOT_FOUND', 'El documento no existe.');
  }

  return document;
}
