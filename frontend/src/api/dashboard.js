import api from './axios.js';

export async function getDashboardStats() {
  const res = await api.get('/dashboard/stats');
  return res.data.data;
}

export async function getDashboardCharts() {
  const res = await api.get('/dashboard/charts');
  return res.data.data;
}
