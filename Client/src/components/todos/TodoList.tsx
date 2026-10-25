import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';
import Table from '../ui/Table';
import { PAGE_SIZE, type Todo } from '../../types/todo';

interface TodoListProps {
  todos: Todo[];
  totalCount: number;
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export default function TodoList({
  todos,
  totalCount,
  page,
  isLoading,
  onPageChange,
  onToggle,
  onEdit,
  onDelete,
}: TodoListProps) {
  const columns = useMemo<ColumnDef<Todo>[]>(
    () => [
      {
        id: 'done',
        header: '',
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="checkbox"
            checked={row.original.isCompleted}
            aria-label={`Mark "${row.original.title}" as ${row.original.isCompleted ? 'pending' : 'completed'}`}
            onChange={() => onToggle(row.original)}
          />
        ),
      },
      {
        id: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="todo-title">
            <strong>{row.original.title}</strong>
            {row.original.description && <span>{row.original.description}</span>}
          </div>
        ),
      },
      { id: 'category', header: 'Category', cell: ({ row }) => <Badge value={row.original.category} /> },
      { id: 'priority', header: 'Priority', cell: ({ row }) => <Badge value={row.original.priority} /> },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge value={row.original.isCompleted ? 'Completed' : 'Pending'} />,
      },
      { id: 'createdAt', header: 'Created At', cell: ({ row }) => formatDate(row.original.createdAt) },
      { id: 'dueDate', header: 'Due Date', cell: ({ row }) => row.original.dueDate ? formatDate(row.original.dueDate) : '—' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="row-actions">
            <Button variant="icon" aria-label={`Edit "${row.original.title}"`} onClick={() => onEdit(row.original)}>
              <Pencil size={16} />
            </Button>
            <Button variant="icon" aria-label={`Delete "${row.original.title}"`} onClick={() => onDelete(row.original)}>
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [onToggle, onEdit, onDelete],
  );

  return (
    <section className="todo-list">
      <Table
        data={todos}
        columns={columns}
        getRowId={(todo) => String(todo.id)}
        isLoading={isLoading}
        emptyMessage="No todos match your filters. Clear them or create a new todo."
        rowClassName={(todo) => (todo.isCompleted ? 'row--done' : '')}
      />
      <footer className="todo-list__footer">
        <span>
          Showing {todos.length} of {totalCount} todos
        </span>
        <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onChange={onPageChange} />
      </footer>
    </section>
  );
}
