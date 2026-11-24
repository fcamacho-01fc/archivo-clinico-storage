const patientSelect = document.querySelector('#patient');
const uploadForm = document.querySelector('#upload-form');
const uploadFields = uploadForm.querySelector('fieldset');
const gallery = document.querySelector('#documents');
const galleryStatus = document.querySelector('#gallery-status');
const statusMessage = document.querySelector('#status');
const documentTemplate = document.querySelector('#document-template');
const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

async function request(url, options) {
  const response = await fetch(url, options).catch(() => {
    throw new Error('No se pudo conectar con Archivo Clínico.');
  });
  if (response.status === 204) return;

  const payload = await response.json().catch(() => {
    throw new Error('El servidor devolvió una respuesta inválida.');
  });
  if (!response.ok) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.dataset.error = String(isError);
}

async function loadPatients() {
  setStatus('Cargando expedientes…');
  try {
    const patients = await request('/api/patients');
    for (const patient of patients) {
      const label = `${patient.recordNumber} ${patient.displayName} (${patient.medicalArea})`;
      patientSelect.add(new Option(label, patient._id));
    }

    if (!patients.length) {
      setStatus('No hay expedientes. Ejecuta el script de datos iniciales.');
      return;
    }

    patientSelect.disabled = false;
    uploadFields.disabled = false;
    setStatus('');
    await loadDocuments(patientSelect.value);
  } catch (error) {
    setStatus(error.message, true);
  }
}

let galleryRequest = 0;

async function loadDocuments(patientId) {
  const currentRequest = ++galleryRequest;
  gallery.replaceChildren();
  galleryStatus.textContent = 'Cargando documentos…';
  galleryStatus.dataset.error = 'false';

  try {
    const documents = await request(`/api/patients/${patientId}/documents`);
    if (currentRequest !== galleryRequest) return;

    galleryStatus.textContent = documents.length ? '' : 'Este expediente todavía no tiene documentos.';
    gallery.append(...documents.map((document) => renderDocument(document, patientId)));
  } catch (error) {
    if (currentRequest !== galleryRequest) return;

    galleryStatus.textContent = error.message;
    galleryStatus.dataset.error = 'true';
  }
}

function renderDocument(document, patientId) {
  const card = documentTemplate.content.cloneNode(true);
  const endpoint = `/api/documents/${document._id}`;
  const image = card.querySelector('img');
  image.src = document.cloudinaryUrl;
  image.alt = `Vista previa de ${document.originalName}`;
  card.querySelector('.filename').textContent = document.originalName;
  card.querySelector('.type').textContent = document.documentType;

  const date = card.querySelector('time');
  date.dateTime = document.createdAt;
  date.textContent = dateFormatter.format(new Date(document.createdAt));
  card.querySelector('.view').href = document.cloudinaryUrl;
  card.querySelector('.download').href = `${endpoint}/download`;

  const deleteButton = card.querySelector('.delete');
  deleteButton.addEventListener('click', async () => {
    if (!window.confirm(`¿Eliminar «${document.originalName}»?`)) return;

    deleteButton.disabled = true;
    setStatus('Eliminando documento…');
    try {
      await request(endpoint, { method: 'DELETE' });
      setStatus('Documento eliminado.');
      if (patientSelect.value === patientId) await loadDocuments(patientId);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      deleteButton.disabled = false;
    }
  });

  return card;
}

patientSelect.addEventListener('change', () => {
  loadDocuments(patientSelect.value);
});

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const patientId = patientSelect.value;
  const body = new FormData(uploadForm);
  uploadFields.disabled = true;
  setStatus('Cargando imágenes…');

  try {
    const documents = await request(`/api/patients/${patientId}/documents`, {
      method: 'POST',
      body,
    });
    uploadForm.reset();
    setStatus(documents.length === 1 ? 'Se cargó un documento.' : `Se cargaron ${documents.length} documentos.`);
    if (patientSelect.value === patientId) await loadDocuments(patientId);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    uploadFields.disabled = false;
  }
});

loadPatients();
