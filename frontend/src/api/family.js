import api from './axios.js';

export async function getFamily(params = {}) {
  const res = await api.get('/family', { params });
  // API returns { success, data: [...], meta }
  return res.data.data;
}

export async function createFamily(payload) {
  const res = await api.post('/family', payload);
  return res.data.data;
}

export async function updateFamily(id, payload) {
  const res = await api.put(`/family/${id}`, payload);
  return res.data.data;
}

export async function deleteFamily(id) {
  const res = await api.delete(`/family/${id}`);
  return res.data.data;
}
