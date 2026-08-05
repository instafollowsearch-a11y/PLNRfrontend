import type { ApiResponse, User } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';

export type AuthPayload = {
  user: User;
  token: string;
};

export function createAuthApi(baseUrl: string) {
  const { apiRequest } = createApiClient({
    baseUrl,
    getAuthToken,
  });

  return {
    register(
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
      inviteToken?: string,
    ) {
      const body: Record<string, string> = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      if (inviteToken?.trim()) {
        body.invite_token = inviteToken.trim();
      }

      return apiRequest<AuthPayload>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    login(email: string, password: string) {
      return apiRequest<AuthPayload>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    logout() {
      return apiRequest<null>('/auth/logout', { method: 'POST' });
    },

    me() {
      return apiRequest<{ user: User }>('/user');
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
export type { ApiResponse };
