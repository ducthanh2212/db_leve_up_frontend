import api from './axios.js';

export async function trainModels(params = {}) {
  const res = await api.post('/ml/train', null, { params });
  return res.data.data;
}

export async function listModels() {
  const res = await api.get('/ml/models');
  return res.data.data;
}

export async function predictAll(modelId) {
  const res = await api.post('/ml/predict/all', null, { params: { model_id: modelId } });
  return res.data.data;
}

export async function getPrediction(studentId) {
  const res = await api.get(`/ml/predict/${studentId}`);
  return res.data.data;
}

export async function explainStudent(studentId) {
  const res = await api.get(`/ml/explain/${studentId}`);
  return res.data.data;
}

export async function earlyWarning(threshold = 0.7, limit = 50) {
  const res = await api.get('/ml/early-warning', { params: { threshold, limit } });
  return res.data.data;
}
