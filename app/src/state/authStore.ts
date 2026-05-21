import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
}

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }
  return null;
};

const initialState: AuthState = {
  accessToken: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens: (
      state,
      action: PayloadAction<{ accessToken: string; keepMeLoggedIn?: boolean }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        if (action.payload.keepMeLoggedIn) {
          localStorage.setItem('accessToken', action.payload.accessToken);
        } else {
          sessionStorage.setItem('accessToken', action.payload.accessToken);
        }
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
      }
    },
  },
});

export const { setAuthTokens, logout } = authSlice.actions;

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
