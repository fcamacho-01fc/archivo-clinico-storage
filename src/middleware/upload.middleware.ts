import type { RequestHandler } from 'express';
import multer, { MulterError } from 'multer';
import { imageMimeTypes, maxFileSize } from '../models/document.model.js';
import { HttpError } from './error.middleware.js';

const maxFiles = 3;

// Multer lee el formulario multipart y deja cada archivo como un buffer en request.files.
const parseFiles = multer({
  storage: multer.memoryStorage(),
  defParamCharset: 'utf8',
  // El parser emite su evento de límite al alcanzar el valor. El byte extra permite exactamente 2 MiB.
  limits: { files: maxFiles, fileSize: maxFileSize + 1, fields: 1, fieldSize: 100 },
  fileFilter: (_request, file, callback) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      callback(new HttpError(415, 'UNSUPPORTED_FILE_TYPE', 'Solo se aceptan imágenes JPEG, PNG y WebP.'));
      return;
    }

    callback(null, true);
  },
}).array('files', maxFiles);

export const receiveFiles: RequestHandler = (request, response, next) => {
  if (!request.is('multipart/form-data')) {
    next(new HttpError(400, 'INVALID_FORM', 'Envía los archivos como multipart/form-data.'));
    return;
  }

  parseFiles(request, response, (error: unknown) => {
    if (error && !(error instanceof MulterError) && !(error instanceof HttpError)) {
      next(new HttpError(400, 'INVALID_FORM', 'El formulario multipart está incompleto o es inválido.'));
      return;
    }

    const files = request.files;
    if (!error && Array.isArray(files) && files.some((file) => file.size > maxFileSize)) {
      next(new MulterError('LIMIT_FILE_SIZE', 'files'));
      return;
    }

    next(error);
  });
};
