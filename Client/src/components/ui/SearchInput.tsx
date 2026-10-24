import { Search, X } from 'lucide-react';
import './SearchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`search ${className}`}>
      <Search size={16} className="search__icon" />
      <input
        className="input"
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search__clear" aria-label="Clear search" onClick={() => onChange('')}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
