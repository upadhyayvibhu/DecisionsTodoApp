import { Bell, ChevronDown, LogOut } from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';
import SearchInput from '../ui/SearchInput';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  fullName: string;
  onSignOut: () => void;
}

export default function Header({ search, onSearchChange, theme, onToggleTheme, fullName, onSignOut }: HeaderProps) {
  const initials = fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
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
      <button className="header__user" title="Sign out" onClick={onSignOut}>
        <span className="avatar">{initials}</span>
        {fullName}
        <ChevronDown size={16} />
      </button>
      <button className="header__icon-btn" aria-label="Sign out" title="Sign out" onClick={onSignOut}><LogOut size={19} /></button>
    </header>
  );
}
