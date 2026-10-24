import { Bell, ChevronDown } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';
import SearchInput from '../ui/SearchInput';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ search, onSearchChange, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <SearchInput
        className="header__search"
        value={search}
        onChange={onSearchChange}
        placeholder="Search todos by title or description…"
      />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <button className="header__icon-btn" aria-label="Notifications">
        <Bell size={20} />
        <span className="header__dot" />
      </button>
      <button className="header__user">
        <span className="avatar">VU</span>
        Vibhuti Upadhyay
        <ChevronDown size={16} />
      </button>
    </header>
  );
}
