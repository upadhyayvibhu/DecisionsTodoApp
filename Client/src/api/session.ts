import type { AuthSession } from './types';

export const SESSION_KEY = 'todopro-session';
export const SESSION_EXPIRED_EVENT = 'todopro-session-expired';

export const notifySessionExpired = () => window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

export const readSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return session.token && new Date(session.expiresAt) > new Date() ? session : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: AuthSession) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const getAccessToken = (): string | null => {
  const session = readSession();
  if (session) return session.token;
  notifySessionExpired();
  return null;
};
