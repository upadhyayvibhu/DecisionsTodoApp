import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/ui/Button';
import StatsCards from '../components/todos/StatsCards';
import TodoFilters from '../components/todos/TodoFilters';
import TodoFormPanel from '../components/todos/TodoFormPanel';
import TodoList from '../components/todos/TodoList';
import DeleteTodoDialog from '../components/todos/DeleteTodoDialog';
import CategoryPanel from '../components/categories/CategoryPanel';
import SettingsPanel from '../components/settings/SettingsPanel';
import { useTodos } from '../hooks/useTodos';
import type { Todo, TodoFormValues } from '../types/todo';
import '../components/layout/Layout.css';
import '../components/todos/Todos.css';
import './Dashboard.css';
import type { Theme } from '../hooks/useTheme';


type PanelState = { mode: 'create' } | { mode: 'edit'; todo: Todo } | { mode: 'categories' } | { mode: 'settings' } | null;

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  return hour < 18 ? 'Good afternoon' : 'Good evening';
};

interface DashboardProps {
  fullName: string;
  email: string;
  theme: Theme;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export default function Dashboard({ fullName, email, theme, onToggleTheme, onSignOut }: DashboardProps) {
  const {
    filters, todos, totalCount, stats, error, isLoading, categories,
    updateFilters, resetFilters, dismissError,
    createTodo, updateTodo, toggleTodo, deleteTodo, createCategory, renameCategory,
  } = useTodos();

  const [panel, setPanel] = useState<PanelState>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (values: TodoFormValues) => {
    const ok = panel?.mode === 'edit' ? await updateTodo(panel.todo.id, values) : await createTodo(values);
    if (ok) setPanel(null);
  };

  const handleToggle = useCallback((todo: Todo) => void toggleTodo(todo.id, !todo.isCompleted), [toggleTodo]);
  const handleEdit = useCallback((todo: Todo) => setPanel({ mode: 'edit', todo }), []);
  const handleDelete = useCallback((todo: Todo) => setTodoToDelete(todo), []);
  const confirmDelete = async () => {
    if (!todoToDelete) return;
    setIsDeleting(true);
    const ok = await deleteTodo(todoToDelete.id);
    setIsDeleting(false);
    if (ok) setTodoToDelete(null);
  };

  const openCreate = () => setPanel({ mode: 'create' });

  return (
    <div className={`app ${panel ? 'app--panel-open' : ''}`}>
      <Sidebar
        activeView={filters.category}
        counts={{ All: stats?.total ?? 0, Work: stats?.byCategory.Work ?? 0, Personal: stats?.byCategory.Personal ?? 0 }}
        onSelect={(category) => updateFilters({ category })}
        onNewCategory={() => setPanel({ mode: 'categories' })}
        onManageCategories={() => setPanel({ mode: 'settings' })}
      />

      <div className="app__main">
        <Header
          search={filters.search}
          onSearchChange={(search) => updateFilters({ search })}
          theme={theme}
          onToggleTheme={onToggleTheme}
          fullName={fullName}
          onSignOut={onSignOut}
        />

        <main className="dashboard">
          <div className="dashboard__top">
            <div>
              <h1>{getGreeting()}, {fullName.split(' ')[0]}! 👋</h1>
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
          <TodoFilters filters={filters} onChange={updateFilters} onReset={resetFilters} categories={categories.map((category) => category.name)} />
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

      {panel && <div className="panel-backdrop" aria-hidden="true" onMouseDown={() => setPanel(null)} />}

      {panel?.mode === 'categories' ? (
        <CategoryPanel categories={categories} onCreate={createCategory} onRename={renameCategory} onClose={() => setPanel(null)} />
      ) : panel?.mode === 'settings' ? (
        <SettingsPanel
          fullName={fullName}
          email={email}
          onManageCategories={() => setPanel({ mode: 'categories' })}
          onSignOut={onSignOut}
          onClose={() => setPanel(null)}
        />
      ) : panel && (
        <TodoFormPanel
          key={panel.mode === 'edit' ? panel.todo.id : 'create'}
          todo={panel.mode === 'edit' ? panel.todo : undefined}
          onSubmit={handleSubmit}
          onClose={() => setPanel(null)}
          categories={categories.map((category) => category.name)}
        />
      )}

      {todoToDelete && (
        <DeleteTodoDialog
          todo={todoToDelete}
          isDeleting={isDeleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => setTodoToDelete(null)}
        />
      )}
    </div>
  );
}
