# Mapa de actividades para el instructor

| TODO | Archivo y función o sección | Objetivo de aprendizaje | Modalidad |
| --- | --- | --- | --- |
| 01 | `package.json` (`dependencies`) | Instalar el SDK oficial | Guiado |
| 02 | `src/config/cloudinary.ts` (`getCloudinary`) | Configurar Cloudinary | Guiado |
| 03 | `src/controllers/document.controller.ts` (`listDocuments`) | Consultar documentos de MongoDB | Guiado |
| 04 | `src/controllers/document.controller.ts` (`uploadDocuments`) | Subir archivos y guardar metadatos | Guiado |
| 05 | `src/controllers/document.controller.ts` (`downloadDocument`) | Descargar un archivo | Individual |
| 06 | `src/controllers/document.controller.ts` (`deleteDocument`) | Eliminar un archivo y sus metadatos | Individual |

## Orden y contratos de las actividades guiadas

1. **01.** Ejecutar `npm install cloudinary` desde la raíz. El SDK queda declarado en `package.json` y registrado en `package-lock.json`.
2. **02.** `getCloudinary` lee las tres variables de Cloudinary del entorno y devuelve el cliente configurado que utilizará el controlador.
3. **03.** `listDocuments` recibe el ID del expediente en la ruta y responde `200` con `{ data }`. La lista contiene los metadatos y las URLs del expediente, o está vacía si todavía no tiene documentos.
4. **04.** `uploadDocuments` recibe el ID del expediente, el tipo de documento y de uno a tres archivos en `request.files`. Responde `201` con `{ data }` y los registros persistidos. Ante un fallo parcial, se espera un error y un intento de limpieza.

## Verificación de las actividades individuales

- **05.** El navegador guarda un archivo que se puede abrir. Una solicitud con un ID de documento inexistente devuelve `404`.
- **06.** Tras la eliminación, la API devuelve `204` y la imagen y sus metadatos dejan de estar disponibles. Cualquier fallo se refleja en la respuesta.
