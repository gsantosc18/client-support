import axios from 'axios';
import { setAuthTokens, logout, AppStore } from '../state/authStore';
import { navigateTo } from '../utils/navigation';

let store: AppStore;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

const api = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  let token = null;
  if (store) {
    const state = store.getState();
    token = state?.auth?.accessToken;
  }

  // Fallback para ler diretamente do storage caso o Redux não esteja inicializado ou esteja vazio
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        store.dispatch(logout());
        localStorage.removeItem('refreshToken');
        navigateTo('/login');
      } catch (refreshError) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
