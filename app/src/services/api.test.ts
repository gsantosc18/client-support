import api, { injectStore } from './api';
import { logout } from '../state/authStore';
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

  beforeAll(() => {
    originalLocalStorage = global.localStorage;

    // Mock localStorage
    const store: Record<string, string> = {};
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
  });

  it('injectStore should inject the store correctly', () => {
    expect(() => injectStore(mockStore as any)).not.toThrow();
  });

  it('request interceptor should add Authorization header if token is present', async () => {
    mockStore.getState.mockReturnValue({
      auth: { accessToken: 'test-access-token' },
    });
    injectStore(mockStore as any);

    // Get the request interceptor
    const requestInterceptor: any = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = { headers: {} as any };
    const result = await requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer test-access-token');
  });

  it('request interceptor should not add Authorization header if token is absent', async () => {
    mockStore.getState.mockReturnValue({
      auth: { accessToken: null },
    });
    injectStore(mockStore as any);

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

  it('response interceptor should logout on 401 unauthorized status', async () => {
    mockStore.getState.mockReturnValue({
      auth: { accessToken: 'token' },
    });
    injectStore(mockStore as any);

    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockError = {
      config: { _retry: false },
      response: { status: 401 },
    };

    localStorage.setItem('refreshToken', 'some-refresh-token');

    await expect(responseInterceptorErr(mockError)).rejects.toEqual(mockError);

    expect(mockStore.dispatch).toHaveBeenCalledWith(logout());
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(navigateTo).toHaveBeenCalledWith('/login');
    expect(mockError.config._retry).toBe(true);
  });

  it('response interceptor should propagate error if status is not 401', async () => {
    const responseInterceptorErr: any = (api.interceptors.response as any).handlers[0].rejected;
    const mockError = {
      config: { _retry: false },
      response: { status: 400 },
    };

    await expect(responseInterceptorErr(mockError)).rejects.toEqual(mockError);
    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});
