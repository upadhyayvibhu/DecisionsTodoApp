import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import StatsCards from '../components/todos/StatsCards';
import TodoFilters from '../components/todos/TodoFilters';
import TodoFormPanel from '../components/todos/TodoFormPanel';
import TodoList from '../components/todos/TodoList';
import { useTodos } from '../hooks/useTodos';
import type { Todo, TodoFormValues } from '../types/todo';
import '../components/layout/Layout.css';
import '../components/todos/Todos.css';
import './Dashboard.css';

type PanelState = { mode: 'create' } | { mode: 'edit'; todo: Todo } | null;

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  return hour < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const {
    filters, todos, totalCount, stats, error, isLoading,
    updateFilters, resetFilters, dismissError,
    createTodo, updateTodo, toggleTodo, deleteTodo,
  } = useTodos();
  const [panel, setPanel] = useState<PanelState>(null);

  const handleSubmit = async (values: TodoFormValues) => {
    const ok = panel?.mode === 'edit' ? await updateTodo(panel.todo.id, values) : await createTodo(values);
    if (ok) setPanel(null);
  };

  const handleToggle = useCallback((todo: Todo) => void toggleTodo(todo.id), [toggleTodo]);
  const handleEdit = useCallback((todo: Todo) => setPanel({ mode: 'edit', todo }), []);
  const handleDelete = useCallback(
    (todo: Todo) => {
      if (window.confirm(`Delete "${todo.title}"? This cannot be undone.`)) void deleteTodo(todo.id);
    },
    [deleteTodo],
  );

  const openCreate = () => setPanel({ mode: 'create' });

  return (
    <div className={`app ${panel ? 'app--panel-open' : ''}`}>
      <Sidebar
        activeView={filters.category}
        counts={{ All: stats?.total ?? 0, Work: stats?.byCategory.Work ?? 0, Personal: stats?.byCategory.Personal ?? 0 }}
        onSelect={(category) => updateFilters({ category })}
        onNewTodo={openCreate}
      />

      <div className="app__main">
        <Header search={filters.search} onSearchChange={(search) => updateFilters({ search })} />

        <main className="dashboard">
          <div className="dashboard__top">
            <div>
              <h1>{getGreeting()}, Vibhuti! 👋</h1>
              <p>Stay organized and make progress, one task at a time.</p>
            </div>
            <Button onClick={openCreate}>
              <Plus size={18} />
              New Todo
            </Button>
          </div>

          {error && (
            <div className="alert" role="alert">
              <span>{error}</span>
              <button onClick={dismissError}>Dismiss</button>
            </div>
          )}

          <StatsCards stats={stats} />
          <TodoFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
          <TodoList
            todos={todos}
            totalCount={totalCount}
            page={filters.page}
            isLoading={isLoading}
            onPageChange={(page) => updateFilters({ page })}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </main>
      </div>

      {panel && (
        <TodoFormPanel
          key={panel.mode === 'edit' ? panel.todo.id : 'create'}
          todo={panel.mode === 'edit' ? panel.todo : undefined}
          onSubmit={handleSubmit}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}
