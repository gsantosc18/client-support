import { authService } from './auth.service';
import api from './api';

jest.mock('./api', () => ({
  post: jest.fn(),
}));

describe('authService', () => {
  const mockData = { email: 'test@test.com', password: 'password123' };
  const mockCompanyId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call register with correct path and data', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { message: 'success' } });

    const result = await authService.register(mockData);

    expect(api.post).toHaveBeenCalledWith(`/auth/register?company_id=${mockCompanyId}`, mockData);
    expect(result).toEqual({ message: 'success' });
  });

  it('should use custom company_id in register if provided', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { message: 'success' } });
    const customCompanyId = '22222222-2222-2222-2222-222222222222';
    const dataWithCompany = { ...mockData, company_id: customCompanyId };

    const result = await authService.register(dataWithCompany);

    expect(api.post).toHaveBeenCalledWith(`/auth/register?company_id=${customCompanyId}`, dataWithCompany);
    expect(result).toEqual({ message: 'success' });
  });

  it('should call login with correct path and data', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { accessToken: 'token' } });

    const result = await authService.login({ ...mockData });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      ...mockData,
      company_id: mockCompanyId,
    });
    expect(result).toEqual({ accessToken: 'token' });
  });

  it('should call recoverPassword with correct path and data', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { message: 'email sent' } });

    const result = await authService.recoverPassword({ email: mockData.email, company_id: '' });

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: mockData.email,
      company_id: mockCompanyId,
    });
    expect(result).toEqual({ message: 'email sent' });
  });

  it('should call resetPassword with correct path and data', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { message: 'password reset' } });
    const resetData = { token: 'token123', password: 'newPassword', password_confirm: 'newPassword' };

    const result = await authService.resetPassword(resetData);

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
    expect(result).toEqual({ message: 'password reset' });
  });

  it('should call logout with correct path', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { message: 'logged out' } });

    const result = await authService.logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(result).toEqual({ message: 'logged out' });
  });
});
