import { Briefcase, CheckCheck, ListTodo, Plus, Settings, User, type LucideIcon } from 'lucide-react';
import type { Category } from '../../types/todo';

type View = Category | 'All';

interface SidebarProps {
  activeView: View;
  counts: Record<View, number>;
  onSelect: (view: View) => void;
  onNewTodo: () => void;
  onManageCategories: () => void;
}

const NAV_ITEMS: { view: View; label: string; icon: LucideIcon }[] = [
  { view: 'All', label: 'All Todos', icon: ListTodo },
  { view: 'Work', label: 'Work', icon: Briefcase },
  { view: 'Personal', label: 'Personal', icon: User },
];

export default function Sidebar({ activeView, counts, onSelect, onNewTodo, onManageCategories }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__logo">
          <CheckCheck size={22} />
        </div>
        <div>
          <div className="brand__name">TodoPro</div>
          <div className="brand__tag">Plan. Focus. Get things done.</div>
        </div>
      </div>

      <nav className="nav" aria-label="Todo views">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            className={`nav__item ${view === activeView ? 'nav__item--active' : ''}`}
            aria-current={view === activeView ? 'page' : undefined}
            onClick={() => onSelect(view)}
          >
            <Icon size={18} />
            {label}
            <span className="nav__count">{counts[view]}</span>
          </button>
        ))}
        <hr className="nav__divider" />
        <button className="nav__item" onClick={onNewTodo}>
          <Plus size={18} />
          New Todo
        </button>
      </nav>

      <div className="sidebar__footer">
        <button className="nav__item" onClick={onManageCategories}>
          <Settings size={18} />
          Settings
        </button>
        <span className="sidebar__version">v1.0.0</span>
      </div>
    </aside>
  );
}
