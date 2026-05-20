import { makeStore, setAuthTokens, logout } from './authStore';

describe('Auth Store', () => {
  it('should handle initial state', () => {
    const store = makeStore();
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle setAuthTokens', () => {
    const store = makeStore();
    store.dispatch(setAuthTokens({ accessToken: 'my-token' }));
    const state = store.getState().auth;
    expect(state.accessToken).toBe('my-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle logout', () => {
    const store = makeStore();
    store.dispatch(setAuthTokens({ accessToken: 'my-token' }));
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
