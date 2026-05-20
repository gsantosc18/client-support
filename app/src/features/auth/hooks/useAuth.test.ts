import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { authService } from '../../../services/auth.service';
import { useDispatch } from 'react-redux';

jest.mock('../../../services/auth.service');
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('useAuth Hook', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    jest.clearAllMocks();
  });

  it('handleLogin successful', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ access_token: '123', refresh_token: '456' });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.handleLogin({ email: 'test@test.com', password: '123' });
      expect(success).toBe(true);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handleLogin failure', async () => {
    (authService.login as jest.Mock).mockRejectedValue({ response: { data: { error: 'Invalid creds' } } });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.handleLogin({ email: 'test@test.com', password: 'wrong' });
      expect(success).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Invalid creds');
  });

  it('handleRegister successful', async () => {
    (authService.register as jest.Mock).mockResolvedValue(true);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.handleRegister({});
      expect(success).toBe(true);
    });
  });

  it('handleLogout successful', async () => {
    (authService.logout as jest.Mock).mockResolvedValue(true);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(mockDispatch).toHaveBeenCalled(); // Should call logout action
  });
});
