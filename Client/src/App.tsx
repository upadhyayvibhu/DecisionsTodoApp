import { useEffect, useState } from 'react';
import { SESSION_EXPIRED_EVENT, clearSession, readSession, saveSession } from './api/session';
import type { AuthSession } from './api/types';
import AuthPage from './components/auth/AuthPage';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(readSession);
  const { theme, toggleTheme } = useTheme();

  const signIn = (nextSession: AuthSession) => {
    saveSession(nextSession);
    setSession(nextSession);
  };
  const signOut = () => {
    clearSession();
    setSession(null);
  };

  useEffect(() => {
    const expireSession = () => signOut();
    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession);
  });

  return session ? (
    <Dashboard fullName={session.fullName} email={session.email} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />
  ) : (
    <AuthPage theme={theme} onToggleTheme={toggleTheme} onAuthenticated={signIn} />
  );
}
