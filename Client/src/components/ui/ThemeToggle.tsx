import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="header__icon-btn"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={onToggle}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
