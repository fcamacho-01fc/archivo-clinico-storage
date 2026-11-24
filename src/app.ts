import express from 'express';
import path from 'node:path';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { patientRouter } from './routes/patient.routes.js';
import { documentRouter } from './routes/document.routes.js';

export const app = express();

app.get('/', (_request, response) => {
  response.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/patients', patientRouter);
app.use('/api/documents', documentRouter);

app.use(notFound);
app.use(errorHandler);
