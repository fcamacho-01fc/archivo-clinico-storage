import type { ErrorRequestHandler, RequestHandler } from 'express';
import { MulterError } from 'multer';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'Ruta inexistente.' } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }

  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      response.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'Cada archivo puede pesar hasta 2 MiB.' },
      });
      return;
    }

    if (error.code === 'LIMIT_FILE_COUNT' || (error.code === 'LIMIT_UNEXPECTED_FILE' && error.field === 'files')) {
      response.status(400).json({
        error: { code: 'TOO_MANY_FILES', message: 'Selecciona un máximo de tres archivos.' },
      });
      return;
    }

    response.status(400).json({
      error: { code: 'INVALID_FORM', message: 'El formulario de carga es inválido.' },
    });
    return;
  }

  response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error al procesar la solicitud.' },
  });
};
