import axios, { AxiosInstance } from 'axios';
import { setAuthTokens, logout, AppStore } from '../state/authStore';
import { navigateTo } from '../utils/navigation';

let store: AppStore;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

const baseURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL,
});

export const refreshClient: AxiosInstance = axios.create({
  baseURL,
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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
        : null;

    if (!refreshToken) {
      if (store) store.dispatch(logout());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('refreshToken');
      }
      navigateTo('/login');
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api.request(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;

    return new Promise((resolve, reject) => {
      refreshClient
        .post('/auth/refresh', { refresh_token: refreshToken })
        .then(({ data }) => {
          const newAccessToken = data.access_token;
          const newRefreshToken = data.refresh_token;

          const isPersistent =
            typeof window !== 'undefined' && !!localStorage.getItem('refreshToken');

          if (store) {
            store.dispatch(
              setAuthTokens({
                accessToken: newAccessToken,
                keepMeLoggedIn: isPersistent,
              })
            );
          }

          if (typeof window !== 'undefined') {
            if (isPersistent) {
              localStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
            } else {
              sessionStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) {
                sessionStorage.setItem('refreshToken', newRefreshToken);
              }
            }
          }

          processQueue(null, newAccessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api.request(originalRequest));
        })
        .catch((refreshError) => {
          processQueue(refreshError, null);
          if (store) store.dispatch(logout());
          if (typeof window !== 'undefined') {
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('refreshToken');
          }
          navigateTo('/login');
          reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
);

export default api;

