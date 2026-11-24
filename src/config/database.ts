import 'dotenv/config';
import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Configura MONGO_URI en el archivo .env.');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
}
