import api from './axios.js';

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  return res.data.data;
}
