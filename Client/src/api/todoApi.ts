import { getAccessToken, notifySessionExpired } from './authApi';
import type { Category, PagedResult, Todo, TodoFilters, TodoFormValues, TodoStats } from '../types/todo';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5284';

interface ApiCategory { id: number; name: string; isSystem: boolean }
interface ApiTodo {
  id: number; title: string; description?: string; priority: Todo['priority']; categoryId: number;
  categoryName: string; dueDate?: string; isCompleted: boolean; createdAt: string;
}

const errorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json() as { detail?: string; title?: string; errors?: Record<string, string[]> };
    return body.errors && Object.values(body.errors).flat()[0] || body.detail || body.title || 'Request failed.';
  } catch { return 'Request failed. Please try again.'; }
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('Your session has expired. Please sign in again.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
  } catch { throw new Error('Unable to reach the server. Please make sure the API is running.'); }
  if (response.status === 401) {
    notifySessionExpired();
    throw new Error('Your session has expired. Please sign in again.');
  }
  if (!response.ok) throw new Error(await errorMessage(response));
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

const toTodo = (todo: ApiTodo): Todo => ({ id: todo.id, title: todo.title, description: todo.description, category: todo.categoryName, categoryId: todo.categoryId, priority: todo.priority, isCompleted: todo.isCompleted, createdAt: todo.createdAt, dueDate: todo.dueDate });

const categoryIdFor = (category: string, categories: ApiCategory[]) => {
  const categoryId = categories.find((item) => item.name === category)?.id;
  if (!categoryId) throw new Error(`The "${category}" category is unavailable.`);
  return categoryId;
};

const queryString = (filters: TodoFilters, categories: ApiCategory[], pageSize: number) => {
  const query = new URLSearchParams({ page: String(filters.page), pageSize: String(pageSize), sortBy: 'created' });
  if (filters.search.trim()) query.set('search', filters.search.trim());
  if (filters.category !== 'All') query.set('categoryId', String(categoryIdFor(filters.category, categories)));
  if (filters.priority !== 'All') query.set('priority', filters.priority);
  if (filters.status !== 'All') query.set('isCompleted', String(filters.status === 'Completed'));
  return query.toString();
};

const getAllTodos = async (): Promise<Todo[]> => {
  const first = await request<PagedResult<ApiTodo>>('/api/todos?page=1&pageSize=100&sortBy=created');
  const pages = Math.ceil(first.totalCount / first.pageSize);
  const remaining = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, index) => request<PagedResult<ApiTodo>>(`/api/todos?page=${index + 2}&pageSize=100&sortBy=created`)));
  return [first, ...remaining].flatMap((page) => page.items.map(toTodo));
};

export type ApiCategoryOption = ApiCategory;

export const todoApi = {
  getCategories: () => request<ApiCategory[]>('/api/categories'),
  createCategory: (name: string) => request<ApiCategory>('/api/categories', { method: 'POST', body: JSON.stringify({ name: name.trim() }) }),
  renameCategory: (id: number, name: string) => request<ApiCategory>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name: name.trim() }) }),
  async getTodos(filters: TodoFilters, categories: ApiCategory[]): Promise<PagedResult<Todo>> {
    const page = await request<PagedResult<ApiTodo>>(`/api/todos?${queryString(filters, categories, 9)}`);
    return { ...page, items: page.items.map(toTodo) };
  },
  async getStats(): Promise<TodoStats> {
    const todos = await getAllTodos();
    const countFor = (category: Category) => todos.filter((todo) => todo.category === category).length;
    const completed = todos.filter((todo) => todo.isCompleted).length;
    return { total: todos.length, completed, pending: todos.length - completed, highPriority: todos.filter((todo) => todo.priority === 'High').length, byCategory: { Work: countFor('Work'), Personal: countFor('Personal') } };
  },
  create: async (values: TodoFormValues, categories: ApiCategory[]) => request<ApiTodo>('/api/todos', { method: 'POST', body: JSON.stringify({ title: values.title.trim(), description: values.description.trim() || null, priority: values.priority, categoryId: categoryIdFor(values.category, categories), dueDate: values.dueDate || null }) }).then(toTodo),
  update: async (id: number, values: TodoFormValues, categories: ApiCategory[]) => request<ApiTodo>(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify({ title: values.title.trim(), description: values.description.trim() || null, priority: values.priority, categoryId: categoryIdFor(values.category, categories), dueDate: values.dueDate || null, isCompleted: values.isCompleted }) }).then(toTodo),
  toggle: async (id: number, isCompleted: boolean) => request<ApiTodo>(`/api/todos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isCompleted }) }).then(toTodo),
  remove: (id: number) => request<void>(`/api/todos/${id}`, { method: 'DELETE' }),
};
