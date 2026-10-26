import { apiRequest } from './httpClient';
import type { AuthSession, LoginRequest, RegisterRequest } from './types';

export const authService = {
  login: (request: LoginRequest) => apiRequest<AuthSession>('/api/auth/login', { method: 'POST', body: request, requiresAuth: false }),
  register: (request: RegisterRequest) => apiRequest<AuthSession>('/api/auth/register', { method: 'POST', body: request, requiresAuth: false }),
};
