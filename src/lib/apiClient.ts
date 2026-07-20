import type { ApiError, ApiResponse } from './apiTypes';

export type ApiClientConfig = {
  baseUrl: string;
  getAuthToken?: () => string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export function createApiClient(config: ApiClientConfig) {
  async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const token = config.getAuthToken?.();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;

    try {
      response = await fetch(`${config.baseUrl}${path}`, {
        ...options,
        headers,
      });
    } catch {
      const error: ApiError = {
        message: 'Unable to reach the server. Check your connection and try again.',
      };
      throw error;
    }

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      const record = isRecord(payload) ? payload : {};
      const error: ApiError = {
        message:
          typeof record.message === 'string' ? record.message : 'Request failed.',
        errors: isRecord(record.errors)
          ? (record.errors as Record<string, string[]>)
          : undefined,
      };
      throw error;
    }

    return payload as ApiResponse<T>;
  }

  return { apiRequest };
}
