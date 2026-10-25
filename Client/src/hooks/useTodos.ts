import { useCallback, useEffect, useState } from 'react';
import { todoApi, type ApiCategoryOption } from '../api/todoApi';
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
  const [categories, setCategories] = useState<ApiCategoryOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0); // bump to refetch after a mutation

  const debouncedSearch = useDebounce(filters.search);
  const { category, priority, status, page } = filters;

  useEffect(() => {
    let ignore = false;

    todoApi.getCategories()
      .then((items) => { if (!ignore) setCategories(items); })
      .catch((e: unknown) => { if (!ignore) setError(toMessage(e)); });

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!categories) return () => { ignore = true; };

    Promise.all([
      todoApi.getTodos({ search: debouncedSearch, category, priority, status, page }, categories),
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
  }, [debouncedSearch, category, priority, status, page, version, categories]);

  /** Changing any filter resets to page 1 unless a page is given explicitly. */
  const updateFilters = useCallback(
    (patch: Partial<TodoFilters>) => setFilters((f) => ({ ...f, page: 1, ...patch })),
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const refreshCategories = useCallback(async (): Promise<boolean> => {
    try {
      const items = await todoApi.getCategories();
      setCategories(items);
      setFilters((current) => current.category !== 'All' && !items.some((item) => item.name === current.category)
        ? { ...current, category: 'All', page: 1 }
        : current);
      return true;
    } catch (e) {
      setError(toMessage(e));
      return false;
    }
  }, []);

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
    isLoading: categories === null || (result === null && error === null),
    categories: categories ?? [],
    updateFilters,
    resetFilters,
    dismissError: () => setError(null),
    createTodo: (values: TodoFormValues) => mutate(() => todoApi.create(values, categories ?? [])),
    updateTodo: (id: number, values: TodoFormValues) => mutate(() => todoApi.update(id, values, categories ?? [])),
    toggleTodo: (id: number, isCompleted: boolean) => mutate(() => todoApi.toggle(id, isCompleted)),
    deleteTodo: (id: number) => mutate(() => todoApi.remove(id)),
    createCategory: async (name: string) => {
      const ok = await mutate(() => todoApi.createCategory(name));
      if (ok) await refreshCategories();
      return ok;
    },
    renameCategory: async (id: number, name: string) => {
      const ok = await mutate(() => todoApi.renameCategory(id, name));
      if (ok) await refreshCategories();
      return ok;
    },
  };
}
