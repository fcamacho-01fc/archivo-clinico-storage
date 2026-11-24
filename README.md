# Archivo Clínico

Aplicación para **Tecnologías de Desarrollo en el Servidor**. El formulario envía las imágenes a Express, Multer las recibe en memoria, Cloudinary almacena los archivos y MongoDB guarda los expedientes y los metadatos. Usa exclusivamente imágenes y expedientes ficticios.

## Instalación y arranque local

Requisitos de la práctica: Node.js 22 o 24, npm, MongoDB local escuchando en el puerto 27017 y una cuenta de Cloudinary, que puede ser gratuita.

1. Inicia tu instancia local de MongoDB. Si ya tienes Docker, puedes levantar una en tu equipo con este comando:

   ```bash
   docker run --name archivo-clinico-mongo -d -p 127.0.0.1:27017:27017 -v archivo-clinico-mongo-data:/data/db mongo:7
   ```

   En sesiones posteriores puedes reutilizar el contenedor con `docker start archivo-clinico-mongo`.

2. Desde la carpeta `archivo-clinico`, instala las dependencias y crea el archivo de configuración local:

   ```bash
   npm ci
   test -f .env || cp .env.example .env
   ```

3. Edita `.env`. Para MongoDB local, usa `MONGO_URI=mongodb://127.0.0.1:27017/archivo_clinico`. Obtén los valores de `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en la consola de Cloudinary. Guárdalos únicamente en `.env`, que Git ignora. Con las claves vacías puedes iniciar la aplicación y listar expedientes. La carga y el borrado de imágenes requieren las credenciales.

4. Carga los tres expedientes iniciales y abre [Archivo Clínico](http://localhost:3000):

   ```bash
   npm run seed
   npm run dev
   ```

Para ejecutar la versión compilada, detén el servidor de desarrollo primero:

```bash
npm run build
npm start
```

Cloudinary recibe recursos de tipo `image` en la carpeta `archivo-clinico-demo`. La configuración usa el modo de carpetas dinámicas. Si tu cuenta utiliza carpetas fijas, cambia `asset_folder: uploadFolder` por `folder: uploadFolder` en la llamada a `upload_stream`. La demo usa entrega pública de imágenes y la opción de descarga `fl_attachment`. Consulta [Modos de carpetas](https://cloudinary.com/documentation/folder_modes) y [Entrega como archivo adjunto](https://cloudinary.com/documentation/transformation_reference#attachment).

## API

Los éxitos con JSON devuelven `{ data }` y los errores devuelven `{ error: { code, message } }`. Los IDs son los `_id` devueltos por MongoDB.

| Método y ruta | Resultado |
| --- | --- |
| `GET /api/patients` | `200` con los expedientes ficticios. |
| `GET /api/patients/:id/documents` | `200` con los documentos del expediente. |
| `POST /api/patients/:id/documents` | `201` con los documentos creados. Envía `multipart/form-data` con uno a tres campos `files` y un `documentType` para todo el lote. |
| `GET /api/documents/:id/url` | `200` con `{ data: { url } }`. |
| `GET /api/documents/:id/download` | `302` hacia la imagen como archivo adjunto. |
| `DELETE /api/documents/:id` | `204` cuando termina la eliminación. |

El formulario acepta los tipos **Nota médica**, **Resultado de estudio** y **Receta**. Los archivos pueden ser JPEG, PNG o WebP y pesar hasta 2 MiB cada uno. La API devuelve `400` para formularios o IDs inválidos, `404` para registros ausentes, `413` por tamaño, `415` por MIME, `502` cuando falla Cloudinary, `503` por credenciales sin configurar y `500` ante fallos de persistencia.

## Verificación manual en cinco pasos

1. Ejecuta `npm run build`, corre `npm run seed` dos veces e inicia el servidor. En un navegador, comprueba que el selector muestre `EXP-001`, `EXP-002` y `EXP-003` una sola vez cada uno.
2. Crea tres imágenes sintéticas, por ejemplo, capturas de texto que digan «Documento ficticio». Cárgalas juntas. Comprueba las tres tarjetas, revisa la carpeta de Cloudinary y cambia de expediente para comprobar la asociación.
3. Prueba un formulario sin archivos, uno con cuatro, un archivo GIF y uno de más de 2 MiB. Comprueba los mensajes de la API y verifica que el lote rechazado no aparezca en la galería. En una prueba de API, usa un ID mal formado y otro válido pero ausente para observar `400` y `404`.
4. Selecciona **Ver** y **Descargar**. Comprueba que la descarga guarde una imagen que puedas abrir. Consulta `/api/documents/:id/url` y comprueba que su valor coincida con la URL de visualización.
5. Elimina una imagen. Verifica que desaparezca del expediente y de la biblioteca de Cloudinary. Consulta su ruta `/url` de nuevo y comprueba el `404`.

## Flujo de almacenamiento

Sigue una petición desde `patient.routes.ts` por el middleware de Multer hasta [el controlador de documentos](src/controllers/document.controller.ts). `uploadImages` envía los buffers a Cloudinary y `saveDocuments` guarda las referencias y los metadatos en MongoDB. `deleteDocument` coordina la eliminación de la imagen y de su registro.

## Límites de la demostración

Las URLs de Cloudinary son públicas. Usa únicamente datos sintéticos. Una aplicación hospitalaria real requeriría autenticación, autorización, acceso privado a archivos, auditoría, validación del contenido, políticas de retención y controles legales y de seguridad.

MongoDB y Cloudinary realizan operaciones independientes. Ante una carga parcial o un error al guardar el lote, el controlador intenta retirar los recursos creados. Si esa limpieza también falla, pueden quedar imágenes o metadatos huérfanos. En un borrado, la imagen puede desaparecer mientras su registro sigue en MongoDB. Un segundo intento puede completar el borrado si Cloudinary indica que la imagen ya está ausente.
