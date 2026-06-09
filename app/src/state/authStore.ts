import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  companyName: string | null;
}

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }
  return null;
};

const getInitialCompany = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('companyName') || sessionStorage.getItem('companyName');
  }
  return null;
};

const initialState: AuthState = {
  accessToken: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  companyName: getInitialCompany(),
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
    setCompany: (
      state,
      action: PayloadAction<{ companyName: string; keepMeLoggedIn?: boolean }>
    ) => {
      state.companyName = action.payload.companyName;
      if (typeof window !== 'undefined') {
        const isPersistent = !!localStorage.getItem('accessToken') || action.payload.keepMeLoggedIn;
        if (isPersistent) {
          localStorage.setItem('companyName', action.payload.companyName);
        } else {
          sessionStorage.setItem('companyName', action.payload.companyName);
        }
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.companyName = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('companyName');
        sessionStorage.removeItem('companyName');
      }
    },
  },
});

export const { setAuthTokens, setCompany, logout } = authSlice.actions;

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
