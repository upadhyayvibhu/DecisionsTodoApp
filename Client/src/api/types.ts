import type { Priority } from '../types/todo';

/** Payloads and responses that mirror the ASP.NET Core API contract. */
export interface AuthSession {
  token: string;
  expiresAt: string;
  fullName: string;
  email: string;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest extends LoginRequest { fullName: string; }

export interface CategoryDto {
  id: number;
  name: string;
  isSystem: boolean;
}

export interface CreateCategoryRequest { name: string; }
export interface UpdateCategoryRequest { name: string; }

export interface TodoDto {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  categoryId: number;
  categoryName: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TodoQuery {
  search?: string;
  priority?: Priority;
  categoryId?: number;
  isCompleted?: boolean;
  sortBy: 'created' | 'dueDate' | 'priority';
  page: number;
  pageSize: number;
}

export interface CreateTodoRequest {
  title: string;
  description: string | null;
  priority: Priority;
  categoryId: number;
  dueDate: string | null;
}

export interface UpdateTodoRequest extends CreateTodoRequest { isCompleted: boolean; }
export interface UpdateTodoStatusRequest { isCompleted: boolean; }

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProblemDetails {
  detail?: string;
  title?: string;
  errors?: Record<string, string[]>;
}
