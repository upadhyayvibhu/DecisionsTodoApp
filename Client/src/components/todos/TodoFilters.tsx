import { ChevronDown } from 'lucide-react';
import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import { CATEGORIES, PRIORITIES, STATUSES, type TodoFilters as Filters } from '../../types/todo';

interface TodoFiltersProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

interface FilterSelectProps<T extends string> {
  label: string;
  allLabel: string;
  value: T | 'All';
  options: readonly T[];
  onChange: (value: T | 'All') => void;
}

function FilterSelect<T extends string>({ label, allLabel, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <div className="select">
      <select
        className="input"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T | 'All')}
      >
        <option value="All">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="select__chevron" />
    </div>
  );
}

export default function TodoFilters({ filters, onChange, onReset }: TodoFiltersProps) {
  return (
    <section className="filters" aria-label="Filters">
      <SearchInput
        className="filters__search"
        value={filters.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search todos…"
      />
      <FilterSelect label="Category" allLabel="All Categories" value={filters.category} options={CATEGORIES} onChange={(category) => onChange({ category })} />
      <FilterSelect label="Priority" allLabel="All Priorities" value={filters.priority} options={PRIORITIES} onChange={(priority) => onChange({ priority })} />
      <FilterSelect label="Status" allLabel="All Status" value={filters.status} options={STATUSES} onChange={(status) => onChange({ status })} />
      <Button variant="secondary" onClick={onReset}>
        Clear
      </Button>
    </section>
  );
}
