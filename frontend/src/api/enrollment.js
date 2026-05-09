import api from './axios.js';

export async function getEnrollment(params = {}) {
  const res = await api.get('/enrollment', { params });
  return res.data.data;
}

export async function createEnrollment(payload) {
  const res = await api.post('/enrollment', payload);
  return res.data.data;
}

export async function updateEnrollment(id, payload) {
  const res = await api.put(`/enrollment/${id}`, payload);
  return res.data.data;
}

export async function deleteEnrollment(id) {
  const res = await api.delete(`/enrollment/${id}`);
  return res.data.data;
}
