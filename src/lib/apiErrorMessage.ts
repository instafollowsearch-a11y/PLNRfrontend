import type { ApiError } from './apiTypes';

export function firstApiError(error: unknown, fallback: string): string {
  const apiError = error as ApiError;
  const fieldMessage = apiError.errors
    ? Object.values(apiError.errors).flat().find((message) => message.length > 0)
    : undefined;

  return fieldMessage || apiError.message || fallback;
}
