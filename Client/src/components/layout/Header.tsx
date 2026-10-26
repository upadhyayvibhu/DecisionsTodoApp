import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  return (
    <header className="header">
      <SearchInput
        className="header__search"
        value={search}
        onChange={onSearchChange}
        placeholder="Search todos by title or description…"
      />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <div className="header__account">
        <button className="header__user" aria-expanded={isUserMenuOpen} aria-haspopup="menu" onClick={() => setIsUserMenuOpen((open) => !open)}>
          <span className="avatar">{initials}</span>
          {fullName}
          <ChevronDown size={16} />
        </button>
        {isUserMenuOpen && (
          <div className="header__user-menu" role="menu">
            <div className="header__user-menu-name">Signed in as <strong>{fullName}</strong></div>
            <button role="menuitem" onClick={onSignOut}><LogOut size={17} /> Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}
