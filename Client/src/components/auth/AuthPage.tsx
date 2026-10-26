import { useState, type FormEvent } from 'react';
import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { authService } from '../../api/authService';
import type { AuthSession } from '../../api/types';
import type { Theme } from '../../hooks/useTheme';
import ThemeToggle from '../ui/ThemeToggle';
import './AuthPage.css';

type Mode = 'login' | 'register';

interface AuthPageProps {
  theme: Theme;
  onToggleTheme: () => void;
  onAuthenticated: (session: AuthSession) => void;
}

const initialFields = { fullName: '', email: '', password: '' };

export default function AuthPage({ theme, onToggleTheme, onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [fields, setFields] = useState(initialFields);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';
  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isRegister && !fields.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!fields.email.trim() || !fields.password) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = isRegister
        ? await authService.register({ ...fields, fullName: fields.fullName.trim(), email: fields.email.trim() })
        : await authService.login({ email: fields.email.trim(), password: fields.password });
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-label="TodoPro introduction">
        <div className="auth-showcase__orb auth-showcase__orb--one" />
        <div className="auth-showcase__orb auth-showcase__orb--two" />
        <div className="auth-showcase__content">
          <div className="auth-brand">
            <span className="auth-brand__logo"><CheckCircle2 size={23} /></span>
            <span>TodoPro</span>
          </div>
          <div className="auth-showcase__copy">
            <span className="auth-eyebrow"><Sparkles size={15} /> Your daily momentum</span>
            <h1>Turn every plan into meaningful progress.</h1>
            <p>A calmer way to organize your work, protect your focus, and celebrate what gets done.</p>
          </div>
          <div className="auth-quote">
            <div className="auth-quote__avatars"><span>AC</span><span>JM</span><span>+8</span></div>
            <p>“TodoPro gives my day a clear beginning and a satisfying finish.”</p>
            <small>Trusted by focused people everywhere</small>
          </div>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card-wrap__theme"><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div>
        <div className="auth-card">
          <div className="auth-card__mobile-brand"><CheckCircle2 size={22} /> TodoPro</div>
          <div className="auth-card__heading">
            <h2>{isRegister ? 'Create your workspace' : 'Welcome back'}</h2>
            <p>{isRegister ? 'Start organizing the work that matters.' : 'Sign in to pick up where you left off.'}</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication options">
            <button className={!isRegister ? 'auth-tabs__item auth-tabs__item--active' : 'auth-tabs__item'} onClick={() => switchMode('login')} role="tab" aria-selected={!isRegister}>Sign in</button>
            <button className={isRegister ? 'auth-tabs__item auth-tabs__item--active' : 'auth-tabs__item'} onClick={() => switchMode('register')} role="tab" aria-selected={isRegister}>Create account</button>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            {isRegister && (
              <label className="auth-field">
                <span>Full name</span>
                <span className="auth-field__control"><UserRound size={18} /><input value={fields.fullName} onChange={(e) => setFields({ ...fields, fullName: e.target.value })} placeholder="Alex Morgan" autoComplete="name" /></span>
              </label>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <span className="auth-field__control"><Mail size={18} /><input type="email" value={fields.email} onChange={(e) => setFields({ ...fields, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></span>
            </label>
            <label className="auth-field">
              <span>{isRegister ? 'Create a password' : 'Password'}</span>
              <span className="auth-field__control"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} value={fields.password} onChange={(e) => setFields({ ...fields, password: e.target.value })} placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} autoComplete={isRegister ? 'new-password' : 'current-password'} /><button className="auth-field__toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
              {isRegister && <small>Use 8+ characters with uppercase, lowercase, and a number.</small>}
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}<span aria-hidden="true">→</span></button>
          </form>
          <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to TodoPro?'} <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')}>{isRegister ? 'Sign in' : 'Create an account'}</button></p>
        </div>
      </section>
    </main>
  );
}
