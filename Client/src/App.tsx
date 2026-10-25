import { useEffect, useState } from 'react';
import { SESSION_EXPIRED_EVENT, SESSION_KEY, type AuthResponse } from './api/authApi';
import AuthPage from './components/auth/AuthPage';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';

const getStoredSession = (): AuthResponse | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthResponse;
    return session.token && new Date(session.expiresAt) > new Date() ? session : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(getStoredSession);
  const { theme, toggleTheme } = useTheme();

  const signIn = (nextSession: AuthResponse) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };
  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  useEffect(() => {
    const expireSession = () => signOut();
    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession);
  });

  return session ? (
    <Dashboard fullName={session.fullName} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />
  ) : (
    <AuthPage theme={theme} onToggleTheme={toggleTheme} onAuthenticated={signIn} />
  );
}
