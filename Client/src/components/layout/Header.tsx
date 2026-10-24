import { Bell, ChevronDown } from 'lucide-react';
import SearchInput from '../ui/SearchInput';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ search, onSearchChange }: HeaderProps) {
  return (
    <header className="header">
      <SearchInput
        className="header__search"
        value={search}
        onChange={onSearchChange}
        placeholder="Search todos by title or description…"
      />
      <button className="header__bell" aria-label="Notifications">
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
