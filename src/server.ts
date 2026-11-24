import { app } from './app.js';
import { connectDatabase } from './config/database.js';

async function start() {
  await connectDatabase();
  const port = Number(process.env.PORT || 3000);

  app.listen(port, '127.0.0.1', () => {
    console.log(`Archivo Clínico disponible en http://localhost:${port}`);
  }).on('error', (error) => {
    console.error('No se pudo abrir el puerto de Archivo Clínico.', error.name);
    process.exit(1);
  });
}

start().catch((error: unknown) => {
  console.error('No se pudo iniciar Archivo Clínico.', error instanceof Error ? error.message : '');
  process.exitCode = 1;
});
