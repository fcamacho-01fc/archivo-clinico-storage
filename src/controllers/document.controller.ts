import type { UploadApiResponse } from 'cloudinary';
import type { Request, Response } from 'express';
import { isObjectIdOrHexString, Types } from 'mongoose';
import { getCloudinary, uploadFolder } from '../config/cloudinary.js';
import { HttpError } from '../middleware/error.middleware.js';
import { Document, documentTypes } from '../models/document.model.js';
import { requirePatient } from './patient.controller.js';

export async function listDocuments(request: Request<{ id: string }>, response: Response) {
  const { id } = request.params;
  await requirePatient(id);
  const documents = await Document.find({ patient: id }).sort({ createdAt: -1, _id: -1 }).lean();
  response.json({ data: documents });
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
  const uploadedImages = await uploadImages(files);
  let documents;
  try {
    documents = await saveDocuments(patientId, documentType, files, uploadedImages);
  } catch (error) {
    await cleanUploadedImages(uploadedImages);
    throw error;
  }

  response.status(201).json({ data: documents });
}

async function uploadImages(files: Express.Multer.File[]) {
  const cloudinary = requireCloudinary();
  const uploadedImages: UploadApiResponse[] = [];

  try {
    for (const file of files) {
      const image = await new Promise<UploadApiResponse>((resolve, reject) => {
        // Multer ya tiene la imagen en memoria, así que se escribe el buffer en el stream del SDK.
        cloudinary.uploader.upload_stream({
          resource_type: 'image',
          asset_folder: uploadFolder,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        }, (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary no devolvió la imagen.'));
            return;
          }

          resolve(result);
        }).end(file.buffer);
      });

      uploadedImages.push(image);
    }

    return uploadedImages;
  } catch {
    await cleanUploadedImages(uploadedImages);
    throw new HttpError(502, 'CLOUDINARY_UPLOAD_FAILED', 'Cloudinary no pudo cargar el lote de imágenes.');
  }
}

async function saveDocuments(
  patientId: string,
  documentType: string,
  files: Express.Multer.File[],
  uploadedImages: UploadApiResponse[],
) {
  const records = uploadedImages.map((image, index) => ({
    _id: new Types.ObjectId(),
    patient: patientId,
    documentType,
    originalName: files[index].originalname,
    cloudinaryPublicId: image.public_id,
    cloudinaryUrl: image.secure_url,
    mimeType: files[index].mimetype,
    size: files[index].size,
  }));

  try {
    return await Document.insertMany(records);
  } catch {
    try {
      // Los IDs del lote permiten retirar cualquier registro escrito antes del fallo.
      await Document.deleteMany({ _id: { $in: records.map((record) => record._id) } });
    } catch {
      console.error('No se pudieron limpiar los metadatos del lote fallido.');
    }

    throw new HttpError(500, 'DOCUMENT_SAVE_FAILED', 'No se pudieron guardar los metadatos en MongoDB.');
  }
}

export async function getDocumentUrl(request: Request<{ id: string }>, response: Response) {
  const document = await requireDocument(request.params.id);
  response.json({ data: { url: document.cloudinaryUrl } });
}

export async function downloadDocument(request: Request<{ id: string }>, response: Response) {
  const document = await requireDocument(request.params.id);
  const downloadUrl = new URL(document.cloudinaryUrl);
  downloadUrl.pathname = downloadUrl.pathname.replace('/image/upload/', '/image/upload/fl_attachment/');
  response.redirect(302, downloadUrl.toString());
}

export async function deleteDocument(request: Request<{ id: string }>, response: Response) {
  const document = await requireDocument(request.params.id);
  // El public_id identifica el recurso que Cloudinary debe borrar. Luego se retira su registro.
  await destroyImage(document.cloudinaryPublicId);

  try {
    await Document.deleteOne({ _id: document._id });
  } catch {
    throw new HttpError(500, 'DOCUMENT_DELETE_FAILED', 'La imagen fue eliminada, pero falta borrar su registro en MongoDB.');
  }

  response.sendStatus(204);
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

function requireCloudinary() {
  try {
    return getCloudinary();
  } catch {
    throw new HttpError(503, 'CLOUDINARY_NOT_CONFIGURED', 'Configura las credenciales de Cloudinary en .env.');
  }
}

async function destroyImage(publicId: string) {
  const cloudinary = requireCloudinary();
  try {
    const { result } = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    if (result !== 'ok' && result !== 'not found') {
      throw new Error('Cloudinary no confirmó la eliminación.');
    }
  } catch {
    throw new HttpError(502, 'CLOUDINARY_DELETE_FAILED', 'Cloudinary no pudo eliminar la imagen.');
  }
}

async function cleanUploadedImages(uploadedImages: UploadApiResponse[]) {
  const results = await Promise.allSettled(
    uploadedImages.map((image) => destroyImage(image.public_id)),
  );

  if (results.some((result) => result.status === 'rejected')) {
    console.error('No se pudieron limpiar todas las imágenes del lote fallido en Cloudinary.');
  }
}
