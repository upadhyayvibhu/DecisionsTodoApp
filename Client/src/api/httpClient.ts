import { getAccessToken, notifySessionExpired } from './session';
import type { ProblemDetails } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL is missing. Add it to Client/.env.local for development.');
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const toErrorMessage = async (response: Response): Promise<string> => {
  try {
    const problem = await response.json() as ProblemDetails;
    return Object.values(problem.errors ?? {}).flat()[0] ?? problem.detail ?? problem.title ?? 'Request failed.';
  } catch {
    return 'Request failed. Please try again.';
  }
};

/** Shared JSON client for every server endpoint. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, requiresAuth = true } = options;
  const token = requiresAuth ? getAccessToken() : null;
  if (requiresAuth && !token) throw new ApiError('Your session has expired. Please sign in again.', 401);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please make sure the API is running.', 0);
  }

  if (response.status === 401) {
    notifySessionExpired();
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }
  if (!response.ok) throw new ApiError(await toErrorMessage(response), response.status);
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
