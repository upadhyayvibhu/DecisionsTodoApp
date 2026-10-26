import { apiRequest } from './httpClient';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from './types';

export const categoryService = {
  getAll: () => apiRequest<CategoryDto[]>('/api/categories'),
  create: (request: CreateCategoryRequest) => apiRequest<CategoryDto>('/api/categories', { method: 'POST', body: request }),
  rename: (id: number, request: UpdateCategoryRequest) => apiRequest<CategoryDto>(`/api/categories/${id}`, { method: 'PUT', body: request }),
};
