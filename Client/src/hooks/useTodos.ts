import { useCallback, useEffect, useState } from 'react';
import { todoApi } from '../api/todoApi';
import {
  DEFAULT_FILTERS,
  PAGE_SIZE,
  type PagedResult,
  type Todo,
  type TodoFilters,
  type TodoFormValues,
  type TodoStats,
} from '../types/todo';
import { useDebounce } from './useDebounce';

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export function useTodos() {
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<PagedResult<Todo> | null>(null);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0); // bump to refetch after a mutation

  const debouncedSearch = useDebounce(filters.search);
  const { category, priority, status, page } = filters;

  useEffect(() => {
    let ignore = false;

    Promise.all([
      todoApi.getTodos({ search: debouncedSearch, category, priority, status, page }),
      todoApi.getStats(),
    ])
      .then(([list, summary]) => {
        if (ignore) return;
        // The last item of a page was deleted: step back to the last valid page.
        if (list.items.length === 0 && list.totalCount > 0) {
          setFilters((f) => ({ ...f, page: Math.ceil(list.totalCount / PAGE_SIZE) }));
          return;
        }
        setResult(list);
        setStats(summary);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!ignore) setError(toMessage(e));
      });

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, category, priority, status, page, version]);

  /** Changing any filter resets to page 1 unless a page is given explicitly. */
  const updateFilters = useCallback(
    (patch: Partial<TodoFilters>) => setFilters((f) => ({ ...f, page: 1, ...patch })),
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  /** Runs a mutation, refetches on success and reports whether it worked. */
  const mutate = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
      setVersion((v) => v + 1);
      return true;
    } catch (e) {
      setError(toMessage(e));
      return false;
    }
  }, []);

  return {
    filters,
    todos: result?.items ?? [],
    totalCount: result?.totalCount ?? 0,
    stats,
    error,
    isLoading: result === null && error === null,
    updateFilters,
    resetFilters,
    dismissError: () => setError(null),
    createTodo: (values: TodoFormValues) => mutate(() => todoApi.create(values)),
    updateTodo: (id: string, values: TodoFormValues) => mutate(() => todoApi.update(id, values)),
    toggleTodo: (id: string) => mutate(() => todoApi.toggle(id)),
    deleteTodo: (id: string) => mutate(() => todoApi.remove(id)),
  };
}
