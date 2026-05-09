import api from './axios.js';

export async function getAcademic(params = {}) {
  const res = await api.get('/academic', { params });
  return res.data.data;
}

export async function createAcademic(payload) {
  const res = await api.post('/academic', payload);
  return res.data.data;
}

export async function updateAcademic(id, payload) {
  const res = await api.put(`/academic/${id}`, payload);
  return res.data.data;
}

export async function deleteAcademic(id) {
  const res = await api.delete(`/academic/${id}`);
  return res.data.data;
}
