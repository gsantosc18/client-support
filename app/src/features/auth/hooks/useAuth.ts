import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { authService } from '../../../services/auth.service';
import { setAuthTokens, logout } from '../../../state/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleLogin = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      dispatch(setAuthTokens({ 
        accessToken: response.access_token,
        keepMeLoggedIn: data.keep_me_logged_in
      }));
      if (data.keep_me_logged_in) {
        localStorage.setItem('refreshToken', response.refresh_token);
      }
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar cadastro');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(logout());
      localStorage.removeItem('refreshToken');
    }
  };

  return { handleLogin, handleRegister, handleLogout, loading, error };
};
