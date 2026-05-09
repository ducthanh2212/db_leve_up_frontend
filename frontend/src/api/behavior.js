import api from './axios.js';

export async function getBehavior(params = {}) {
  const res = await api.get('/behavior', { params });
  return res.data.data;
}

export async function createBehavior(payload) {
  const res = await api.post('/behavior', payload);
  return res.data.data;
}

export async function updateBehavior(id, payload) {
  const res = await api.put(`/behavior/${id}`, payload);
  return res.data.data;
}

export async function deleteBehavior(id) {
  const res = await api.delete(`/behavior/${id}`);
  return res.data.data;
}
