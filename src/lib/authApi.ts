import type { ApiResponse, User } from './apiTypes';
import { createApiClient } from './apiClient';
import { getAuthToken } from './authStorage';
import { normalizeEmail } from './email';

export type AuthPayload = {
  user: User;
  token: string;
};

export type ProfileUpdate = {
  name?: string;
  email?: string;
  city?: string;
  current_password?: string;
  interests?: string[];
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
        email: normalizeEmail(email),
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
        body: JSON.stringify({ email: normalizeEmail(email), password }),
      });
    },

    loginWithGoogle(
      idToken: string | null | undefined,
      inviteToken?: string,
      accessToken?: string | null,
    ) {
      const body: Record<string, string> = {};

      if (idToken?.trim()) {
        body.id_token = idToken.trim();
      }

      if (inviteToken?.trim()) {
        body.invite_token = inviteToken.trim();
      }

      if (accessToken?.trim()) {
        body.access_token = accessToken.trim();
      }

      return apiRequest<AuthPayload>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    forgotPassword(email: string) {
      return apiRequest<null>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: normalizeEmail(email) }),
      });
    },

    resetPassword(
      email: string,
      token: string,
      password: string,
      passwordConfirmation: string,
    ) {
      return apiRequest<null>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizeEmail(email),
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
    },

    logout() {
      return apiRequest<null>('/auth/logout', { method: 'POST' });
    },

    me() {
      return apiRequest<{ user: User }>('/user');
    },

    updateProfile(profile: ProfileUpdate) {
      const body =
        typeof profile.email === 'string'
          ? { ...profile, email: normalizeEmail(profile.email) }
          : profile;

      return apiRequest<{ user: User; weekend_delivery?: string }>('/user', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },

    changePassword(currentPassword: string, password: string, passwordConfirmation: string) {
      return apiRequest<null>('/user/password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
    },

    deleteAccount(password: string) {
      return apiRequest<null>('/user', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
export type { ApiResponse };
