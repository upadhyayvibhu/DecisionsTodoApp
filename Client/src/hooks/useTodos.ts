import { useEffect, useState } from 'react';
import { categoryService } from '../api/categoryService';
import { todoService } from '../api/todoService';
import type { CategoryDto } from '../api/types';
import { toTodo } from '../mappers/todoMapper';
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

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
};

const findCategoryId = (categoryName: string, categories: CategoryDto[]): number => {
  const category = categories.find((item) => item.name === categoryName);

  if (!category) {
    throw new Error(`The "${categoryName}" category is unavailable.`);
  }

  return category.id;
};

const buildTodoQuery = (filters: TodoFilters, categories: CategoryDto[]) => {
  const categoryId = filters.category === 'All'
    ? undefined
    : findCategoryId(filters.category, categories);
  const isCompleted = filters.status === 'All'
    ? undefined
    : filters.status === 'Completed';

  return {
    search: filters.search.trim() || undefined,
    priority: filters.priority === 'All' ? undefined : filters.priority,
    categoryId,
    isCompleted,
    sortBy: 'created' as const,
    page: filters.page,
    pageSize: PAGE_SIZE,
  };
};

const getAllTodos = async (): Promise<Todo[]> => {
  const firstPage = await todoService.search({ sortBy: 'created', page: 1, pageSize: 100 });
  const todos = firstPage.items.map(toTodo);
  const totalPages = Math.ceil(firstPage.totalCount / firstPage.pageSize);

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await todoService.search({ sortBy: 'created', page, pageSize: 100 });
    todos.push(...response.items.map(toTodo));
  }

  return todos;
};

const calculateStats = (todos: Todo[]): TodoStats => {
  const completed = todos.filter((todo) => todo.isCompleted).length;
  return {
    total: todos.length,
    completed,
    pending: todos.length - completed,
    highPriority: todos.filter((todo) => todo.priority === 'High').length,
    byCategory: {
      Work: todos.filter((todo) => todo.category === 'Work').length,
      Personal: todos.filter((todo) => todo.category === 'Personal').length,
    },
  };
};

export function useTodos() {
  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<PagedResult<Todo> | null>(null);
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [categories, setCategories] = useState<CategoryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Changing this number tells the loading effect to fetch the latest todos.
  const [reloadTodos, setReloadTodos] = useState(0);

  const debouncedSearch = useDebounce(filters.search);
  const { category, priority, status, page } = filters;

  useEffect(() => {
    let componentIsStillOnScreen = true;

    async function loadCategories() {
      try {
        const items = await categoryService.getAll();
        if (componentIsStillOnScreen) setCategories(items);
      } catch (error) {
        if (componentIsStillOnScreen) setError(getErrorMessage(error));
      }
    }

    void loadCategories();

    return () => { componentIsStillOnScreen = false; };
  }, []);

  useEffect(() => {
    if (!categories) return;

    // Keep this non-null value for the async function below.
    const categoryList = categories;
    let componentIsStillOnScreen = true;

    async function loadTodos() {
      try {
        const currentFilters = { search: debouncedSearch, category, priority, status, page };
        const response = await todoService.search(buildTodoQuery(currentFilters, categoryList));
        const allTodos = await getAllTodos();

        if (!componentIsStillOnScreen) return;

        const list: PagedResult<Todo> = {
          ...response,
          items: response.items.map(toTodo),
        };
        // The last item of a page was deleted: step back to the last valid page.
        if (list.items.length === 0 && list.totalCount > 0) {
          setFilters((f) => ({ ...f, page: Math.ceil(list.totalCount / PAGE_SIZE) }));
          return;
        }

        setResult(list);
        setStats(calculateStats(allTodos));
        setError(null);
      } catch (error) {
        if (componentIsStillOnScreen) setError(getErrorMessage(error));
      }
    }

    void loadTodos();

    return () => {
      componentIsStillOnScreen = false;
    };
  }, [debouncedSearch, category, priority, status, page, reloadTodos, categories]);

  /** Changing any filter resets to page 1 unless a page is given explicitly. */
  const updateFilters = (patch: Partial<TodoFilters>) => {
    setFilters((current) => ({ ...current, page: 1, ...patch }));
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const refreshCategories = async (): Promise<boolean> => {
    try {
      const items = await categoryService.getAll();
      setCategories(items);
      setFilters((current) => current.category !== 'All' && !items.some((item) => item.name === current.category)
        ? { ...current, category: 'All', page: 1 }
        : current);
      return true;
    } catch (error) {
      setError(getErrorMessage(error));
      return false;
    }
  };

  /** Runs a mutation, refetches on success and reports whether it worked. */
  const runTodoAction = async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
      setReloadTodos((current) => current + 1);
      return true;
    } catch (error) {
      setError(getErrorMessage(error));
      return false;
    }
  };

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
    createTodo: (values: TodoFormValues) => runTodoAction(() => todoService.create({
      title: values.title.trim(), description: values.description.trim() || null, priority: values.priority,
      categoryId: findCategoryId(values.category, categories ?? []), dueDate: values.dueDate || null,
    })),
    updateTodo: (id: number, values: TodoFormValues) => runTodoAction(() => todoService.update(id, {
      title: values.title.trim(), description: values.description.trim() || null, priority: values.priority,
      categoryId: findCategoryId(values.category, categories ?? []), dueDate: values.dueDate || null,
      isCompleted: values.isCompleted,
    })),
    toggleTodo: (id: number, isCompleted: boolean) => runTodoAction(() => todoService.updateStatus(id, { isCompleted })),
    deleteTodo: (id: number) => runTodoAction(() => todoService.remove(id)),
    createCategory: async (name: string) => {
      const ok = await runTodoAction(() => categoryService.create({ name: name.trim() }));
      if (ok) await refreshCategories();
      return ok;
    },
    renameCategory: async (id: number, name: string) => {
      const ok = await runTodoAction(() => categoryService.rename(id, { name: name.trim() }));
      if (ok) await refreshCategories();
      return ok;
    },
  };
}
