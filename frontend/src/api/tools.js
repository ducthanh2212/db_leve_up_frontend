import api from './axios.js';

export async function importCsv(table, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/tools/import/${table}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data.data;
}

export function downloadTemplate(table) {
  window.open(`http://localhost:8000/api/v1/tools/import/template/${table}`, '_blank');
}

export function exportTable(table) {
  window.open(`http://localhost:8000/api/v1/tools/export/${table}`, '_blank');
}

export async function generateData(payload) {
  const res = await api.post('/tools/generate', payload);
  return res.data.data;
}
