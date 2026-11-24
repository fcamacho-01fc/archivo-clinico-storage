import { model, Schema } from 'mongoose';

export const documentTypes = ['Nota médica', 'Resultado de estudio', 'Receta'];
export const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const maxFileSize = 2 * 1024 * 1024;

// MongoDB guarda la referencia y los metadatos. Cloudinary almacena la imagen.
const documentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  documentType: { type: String, required: true, enum: documentTypes },
  originalName: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  mimeType: { type: String, required: true, enum: imageMimeTypes },
  size: { type: Number, required: true, min: 1, max: maxFileSize },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
});

export const Document = model('Document', documentSchema);
