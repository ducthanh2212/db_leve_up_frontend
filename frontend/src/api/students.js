import api from './axios.js';

export async function getStudents(params = {}) {
  const res = await api.get('/students', { params });
  return res.data.data;
}

export async function getStudentById(id) {
  const res = await api.get(`/students/${id}`);
  return res.data.data;
}

export async function createStudent(payload) {
  const res = await api.post('/students', payload);
  return res.data.data;
}

export async function updateStudent(id, payload) {
  const res = await api.put(`/students/${id}`, payload);
  return res.data.data;
}

export async function deleteStudent(id) {
  const res = await api.delete(`/students/${id}`);
  return res.data.data;
}
