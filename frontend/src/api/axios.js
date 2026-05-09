import Axios from 'axios';

const api = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dews_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('dews_token');
      localStorage.removeItem('dews_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;