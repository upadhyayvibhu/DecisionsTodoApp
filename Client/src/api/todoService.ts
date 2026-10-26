import { apiRequest } from './httpClient';
import type { CreateTodoRequest, PagedResponse, TodoDto, TodoQuery, UpdateTodoRequest, UpdateTodoStatusRequest } from './types';

const toQueryString = (query: TodoQuery): string => {
  const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize), sortBy: query.sortBy });
  if (query.search) params.set('search', query.search);
  if (query.priority) params.set('priority', query.priority);
  if (query.categoryId) params.set('categoryId', String(query.categoryId));
  if (query.isCompleted !== undefined) params.set('isCompleted', String(query.isCompleted));
  return params.toString();
};

export const todoService = {
  search: (query: TodoQuery) => apiRequest<PagedResponse<TodoDto>>(`/api/todos?${toQueryString(query)}`),
  create: (request: CreateTodoRequest) => apiRequest<TodoDto>('/api/todos', { method: 'POST', body: request }),
  update: (id: number, request: UpdateTodoRequest) => apiRequest<TodoDto>(`/api/todos/${id}`, { method: 'PUT', body: request }),
  updateStatus: (id: number, request: UpdateTodoStatusRequest) => apiRequest<TodoDto>(`/api/todos/${id}/status`, { method: 'PATCH', body: request }),
  remove: (id: number) => apiRequest<void>(`/api/todos/${id}`, { method: 'DELETE' }),
};
