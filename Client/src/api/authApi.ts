export interface AuthResponse {
  token: string;
  expiresAt: string;
  fullName: string;
  email: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues extends LoginValues {
  fullName: string;
}

export const SESSION_KEY = 'todopro-session';
export const SESSION_EXPIRED_EVENT = 'todopro-session-expired';

export const notifySessionExpired = () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5284';

const readError = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null) {
      const details = body as { detail?: string; title?: string; errors?: Record<string, string[]> };
      const validationMessage = details.errors && Object.values(details.errors).flat()[0];
      return validationMessage ?? details.detail ?? details.title ?? 'Unable to complete your request.';
    }
  } catch {
    // A non-JSON response is handled by the generic message below.
  }
  return 'Unable to complete your request. Please try again.';
};

async function request<T>(path: string, payload: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Unable to reach the server. Please make sure the API is running.');
  }

  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<T>;
}

export const authApi = {
  login: (values: LoginValues) => request<AuthResponse>('login', values),
  register: (values: RegisterValues) => request<AuthResponse>('register', values),
};

export const getAccessToken = (): string | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthResponse;
    if (session.token && new Date(session.expiresAt) > new Date()) return session.token;
    notifySessionExpired();
    return null;
  } catch {
    return null;
  }
};
