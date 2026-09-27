import api, { injectStore, refreshClient } from './api';
import { logout, setAuthTokens } from '../state/authStore';
import { navigateTo } from '../utils/navigation';

// Mock store
const mockStore = {
  getState: jest.fn(),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
  replaceReducer: jest.fn(),
  [Symbol.observable]: jest.fn(),
};

// Mock navigateTo
jest.mock('../utils/navigation', () => ({
  navigateTo: jest.fn(),
}));

describe('api service interceptors', () => {
  let originalLocalStorage: any;
  let store: Record<string, string>;

  beforeAll(() => {
    originalLocalStorage = global.localStorage;

    // Mock localStorage
    store = {};
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { for (const k in store) delete store[k]; },
    };
    Object.defineProperty(global, 'localStorage', { value: mockStorage, writable: true });
  });

  afterAll(() => {
    Object.defineProperty(global, 'localStorage', { value: originalLocalStorage });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    store = {};
    injectStore(mockStore as any);
  });

  it('injectStore should inject the store correctly', () => {
    expect(() => injectStore(mockStore as any)).not.toThrow();
  });

  it('request interceptor should add Authorization header if token is present', async () => {
    mockStore.getState.mockReturnValue({
      auth: { accessToken: 'test-access-token' },
    });

    const requestInterceptor: any = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as any };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer test-access-token');
  });

  it('request interceptor should not add Authorization header if token is absent', async () => {
    mockStore.getState.mockReturnValue({
      auth: { accessToken: null },
    });

    const requestInterceptor: any = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as any };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('response interceptor should return response directly if successful', async () => {
    const responseInterceptor: any = (api.interceptors.response as any).handlers[0].fulfilled;
    const mockResponse = { data: 'test-data' };
    const result = await responseInterceptor(mockResponse);
    expect(result).toBe(mockResponse);
  });

  it('response interceptor should logout on 401 unauthorized status when no refreshToken exists', async () => {
    mockStore.getState.mockReturnValue({
      auth: { accessToken: 'token' },
    });

    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockError = {
      config: { _retry: false, headers: {} },
      response: { status: 401 },
    };

    localStorage.removeItem('refreshToken');

    await expect(responseInterceptorErr(mockError)).rejects.toEqual(mockError);

    expect(mockStore.dispatch).toHaveBeenCalledWith(logout());
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(navigateTo).toHaveBeenCalledWith('/login');
  });

  it('response interceptor should not attempt refresh if url is /auth/login or /auth/refresh', async () => {
    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockErrorLogin = {
      config: { _retry: false, url: '/auth/login', headers: {} },
      response: { status: 401 },
    };

    await expect(responseInterceptorErr(mockErrorLogin)).rejects.toEqual(mockErrorLogin);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });

  it('response interceptor should successfully refresh token and retry original request', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh-token');

    const postSpy = jest.spyOn(refreshClient, 'post').mockResolvedValueOnce({
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      },
    });

    const requestSpy = jest.spyOn(api, 'request').mockResolvedValueOnce({ data: 'success-retried' } as any);

    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockError = {
      config: { _retry: false, headers: {} as any },
      response: { status: 401 },
    };

    const result = await responseInterceptorErr(mockError);

    expect(postSpy).toHaveBeenCalledWith('/auth/refresh', {
      refresh_token: 'valid-refresh-token',
    });
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      setAuthTokens({
        accessToken: 'new-access-token',
        keepMeLoggedIn: true,
      })
    );
    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    expect(mockError.config.headers.Authorization).toBe('Bearer new-access-token');
  });

  it('response interceptor should queue concurrent 401 requests while refresh is in progress', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh-token');

    let resolveRefresh: any;
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    jest.spyOn(refreshClient, 'post').mockReturnValueOnce(refreshPromise as any);
    jest.spyOn(api, 'request').mockResolvedValue({ data: 'queued-retried' } as any);

    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;

    const mockError1 = {
      config: { _retry: false, headers: {} as any },
      response: { status: 401 },
    };
    const mockError2 = {
      config: { _retry: false, headers: {} as any },
      response: { status: 401 },
    };

    // First request triggers refresh
    const promise1 = responseInterceptorErr(mockError1);
    // Second request should be enqueued
    const promise2 = responseInterceptorErr(mockError2);

    // Resolve the refresh
    resolveRefresh({
      data: {
        access_token: 'concurrent-access-token',
        refresh_token: 'concurrent-refresh-token',
      },
    });

    await Promise.all([promise1, promise2]);

    expect(mockError1.config.headers.Authorization).toBe('Bearer concurrent-access-token');
    expect(mockError2.config.headers.Authorization).toBe('Bearer concurrent-access-token');
  });

  it('response interceptor should logout and reject if refresh token call fails', async () => {
    localStorage.setItem('refreshToken', 'expired-refresh-token');

    jest.spyOn(refreshClient, 'post').mockRejectedValueOnce(new Error('refresh failed'));

    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockError = {
      config: { _retry: false, headers: {} as any },
      response: { status: 401 },
    };

    await expect(responseInterceptorErr(mockError)).rejects.toThrow('refresh failed');

    expect(mockStore.dispatch).toHaveBeenCalledWith(logout());
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(navigateTo).toHaveBeenCalledWith('/login');
  });

  it('response interceptor should propagate error if status is not 401', async () => {
    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockError = {
      config: { _retry: false, headers: {} },
      response: { status: 400 },
    };

    await expect(responseInterceptorErr(mockError)).rejects.toEqual(mockError);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});
