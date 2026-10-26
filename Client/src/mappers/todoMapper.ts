import type { Todo } from '../types/todo';
import type { TodoDto } from '../api/types';

/** Converts the API contract into the client view model. */
export const toTodo = (todo: TodoDto): Todo => ({
  id: todo.id,
  title: todo.title,
  description: todo.description,
  category: todo.categoryName,
  categoryId: todo.categoryId,
  priority: todo.priority,
  isCompleted: todo.isCompleted,
  createdAt: todo.createdAt,
  dueDate: todo.dueDate,
});
