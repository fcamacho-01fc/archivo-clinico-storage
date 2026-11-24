# Archivo Clínico

Proyecto inicial del Code Lab de **Tecnologías de Desarrollo en el Servidor**. La interfaz permite seleccionar expedientes ficticios y, al completar los ejercicios, gestionar sus imágenes. MongoDB guarda los expedientes y los metadatos. Cloudinary almacenará las imágenes.

## Instalación y arranque local

Requisitos: Node.js 22 o 24, npm y MongoDB local. Para el arranque inicial basta con MongoDB.

1. Inicia MongoDB en el puerto 27017. Si ya tienes una instancia local, úsala. Si usas Docker y necesitas crear el contenedor, ejecuta:

   ```bash
   docker run --name archivo-clinico-mongo -d -p 127.0.0.1:27017:27017 -v archivo-clinico-mongo-data:/data/db mongo:7
   ```

   Para volver a iniciar el contenedor existente, ejecuta `docker start archivo-clinico-mongo`.

2. Desde la raíz del proyecto, instala las dependencias y prepara la configuración:

   ```bash
   npm ci
   test -f .env || cp .env.example .env
   ```

   Verifica en `.env` que `MONGO_URI` apunte a `mongodb://127.0.0.1:27017/archivo_clinico_estudiante`. Deja vacías las variables de Cloudinary hasta configurar el SDK. Cuando obtengas tus credenciales, guárdalas en `.env`.

3. Carga los tres expedientes ficticios e inicia el servidor de desarrollo:

   ```bash
   npm run seed
   npm run dev
   ```

   Abre [Archivo Clínico](http://localhost:3000). Para ejecutar la versión compilada, detén el servidor de desarrollo y usa `npm run build` seguido de `npm start`.

## Actividades por completar (TODOs)

Sigue el orden **01 → 02 → 03 → 04 → 05 → 06**. Las actividades 01 a 04 son guiadas. Las actividades 05 y 06 se resuelven de forma individual.

| TODO | Actividad | Archivo a modificar | Función o sección | Modalidad |
| --- | --- | --- | --- | --- |
| 01 | Instalar Cloudinary | `package.json` | Dependencias (`dependencies`) | Guiado |
| 02 | Configurar Cloudinary | `src/config/cloudinary.ts` | `getCloudinary` | Guiado |
| 03 | Consultar documentos y URLs desde MongoDB | `src/controllers/document.controller.ts` | `listDocuments` | Guiado |
| 04 | Subir archivos y guardar metadatos | `src/controllers/document.controller.ts` | `uploadDocuments` | Guiado |
| 05 | Descargar un documento | `src/controllers/document.controller.ts` | `downloadDocument` | Individual |
| 06 | Eliminar un documento | `src/controllers/document.controller.ts` | `deleteDocument` | Individual |

**TODO 01.** Desde la raíz del proyecto, ejecuta `npm install cloudinary`. Para la siguiente actividad, configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en `.env`.

## Comprobaciones

**Antes de completar las actividades**

- Ejecuta `npm run build` y comprueba que la página abra con los expedientes `EXP-001`, `EXP-002` y `EXP-003`.
- Selecciona un expediente y envía una imagen sintética válida. La galería y el formulario mostrarán que sus operaciones están pendientes. Una petición válida a una ruta pendiente devuelve `501` con un mensaje en español.

**Después de completar las actividades**

- Carga hasta tres imágenes sintéticas JPEG, PNG o WebP de hasta 2 MiB cada una. Recarga la página y comprueba que estén en el expediente correcto y que aparezcan sus metadatos y vistas previas.
- Descarga un documento y abre el archivo guardado. Elimina otro y comprueba que desaparezca de la galería, de MongoDB y de Cloudinary. Verifica que la API devuelva `404` si el documento solicitado ya no existe.

Usa exclusivamente imágenes y expedientes ficticios. Las URLs públicas de esta práctica son inadecuadas para datos clínicos reales.
