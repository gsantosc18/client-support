import axios from 'axios';
import { setAuthTokens, logout, AppStore } from '../state/authStore';
import { navigateTo } from '../utils/navigation';

let store: AppStore;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  if (store) {
    const state = store.getState();
    if (state?.auth?.accessToken) {
      config.headers.Authorization = `Bearer ${state.auth.accessToken}`;
    }
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
