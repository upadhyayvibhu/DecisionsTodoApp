export const CATEGORIES = ['Work', 'Personal'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const STATUSES = ['Pending', 'Completed'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Todo {
  id: string;
  title: string;
  description?: string;
  category: Category;
  status?: Status;
  priority: Priority;
  isCompleted: boolean;
  createdAt: string; // ISO 8601, same shape the .NET API will return
}

/** Shape of the create / edit form. */
export interface TodoFormValues {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  isCompleted: boolean;
}

export interface TodoFilters {
  search: string;
  category: Category | 'All';
  priority: Priority | 'All';
  status: Status | 'All';
  page: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  byCategory: Record<Category, number>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const PAGE_SIZE = 9;

export const DEFAULT_FILTERS: TodoFilters = {
  search: '',
  category: 'All',
  priority: 'All',
  status: 'All',
  page: 1,
};
