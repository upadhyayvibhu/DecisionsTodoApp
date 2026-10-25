import {
  PAGE_SIZE,
  type PagedResult,
  type Todo,
  type TodoFilters,
  type TodoFormValues,
  type TodoStats,
} from '../types/todo';
import { seedTodos } from './mockData';

/**
 * Browser-only, in-memory todo data service.
 * Every method is async, keeping data access isolated if persistent storage is
 * added later.
 */
let store: Todo[] = [...seedTodos];

const LATENCY_MS = 250;
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));

const matches = (todo: Todo, f: TodoFilters): boolean => {
  const term = f.search.trim().toLowerCase();
  const matchesSearch =
    !term ||
    todo.title.toLowerCase().includes(term) ||
    (todo.description ?? '').toLowerCase().includes(term);

  return (
    matchesSearch &&
    (f.category === 'All' || todo.category === f.category) &&
    (f.priority === 'All' || todo.priority === f.priority) &&
    (f.status === 'All' || (f.status === 'Completed') === todo.isCompleted)
  );
};

const findIndex = (id: string): number => {
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Todo not found.');
  return index;
};

export const todoApi = {
  async getTodos(filters: TodoFilters): Promise<PagedResult<Todo>> {
    await wait();
    const filtered = store
      .filter((t) => matches(t, filters))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (filters.page - 1) * PAGE_SIZE;

    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      totalCount: filtered.length,
      page: filters.page,
      pageSize: PAGE_SIZE,
    };
  },

  async getStats(): Promise<TodoStats> {
    await wait();
    const completed = store.filter((t) => t.isCompleted).length;
    return {
      total: store.length,
      completed,
      pending: store.length - completed,
      highPriority: store.filter((t) => t.priority === 'High').length,
      byCategory: {
        Work: store.filter((t) => t.category === 'Work').length,
        Personal: store.filter((t) => t.category === 'Personal').length,
      },
    };
  },

  async create(values: TodoFormValues): Promise<Todo> {
    await wait();
    const created: Todo = {
      ...values,
      id: crypto.randomUUID(),
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    store = [created, ...store];
    return created;
  },

  async update(id: string, values: TodoFormValues): Promise<Todo> {
    await wait();
    const index = findIndex(id);
    const updated: Todo = {
      ...store[index],
      ...values,
      title: values.title.trim(),
      description: values.description.trim() || undefined,
    };
    store = store.map((t, i) => (i === index ? updated : t));
    return updated;
  },

  async toggle(id: string): Promise<Todo> {
    await wait();
    const index = findIndex(id);
    const toggled = { ...store[index], isCompleted: !store[index].isCompleted };
    store = store.map((t, i) => (i === index ? toggled : t));
    return toggled;
  },

  async remove(id: string): Promise<void> {
    await wait();
    findIndex(id);
    store = store.filter((t) => t.id !== id);
  },
};
