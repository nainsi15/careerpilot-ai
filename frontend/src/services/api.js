import axios from 'axios';

const API_BASE = 'https://careerpilot-ai-4yvk.onrender.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cp_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const resumeAPI = {
  upload: (formData) =>
    api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

export const jobAPI = {
  upload: (data) => api.post('/job/upload', data)
};

export const analysisAPI = {
  run: (data) => api.post('/analysis/run', data),
  getHistory: () => api.get('/analysis/history'),
  getById: (id) => api.get(`/analysis/${id}`),
  compare: (id1, id2) =>
    api.get(`/analysis/compare?id1=${id1}&id2=${id2}`)
};

export const reportAPI = {
  getDownloadUrl: (id) => `${API_BASE}/report/${id}`
};

export default api;