import type { Category, Priority, Todo } from '../types/todo';

const todo = (
  id: number,
  title: string,
  description: string,
  category: Category,
  priority: Priority,
  isCompleted: boolean,
  day: number,
): Todo => ({
  id,
  title,
  description,
  category,
  categoryId: category === 'Work' ? 1 : 2,
  priority,
  isCompleted,
  dueDate: '',
  createdAt: `2026-10-${String(day).padStart(2, '0')}T09:00:00Z`,
});

export const seedTodos: Todo[] = [
  todo(1, 'Finish project documentation', 'Complete the technical documentation for the assessment.', 'Work', 'High', false, 22),
  todo(2, 'Go for a morning walk', '30 minutes walk in the nearby park.', 'Personal', 'Medium', true, 21),
  todo(3, 'Prepare presentation', 'Slides for client meeting next week.', 'Work', 'High', false, 20),
  todo(4, 'Read a book', 'Finish at least 2 chapters this week.', 'Personal', 'Low', false, 19),
  todo(5, 'Team standup', 'Daily team sync at 10:00 AM.', 'Work', 'Medium', true, 18),
  todo(6, 'Buy groceries', 'Milk, eggs, bread and vegetables.', 'Personal', 'Low', false, 17),
  todo(7, 'Update profile', 'Update LinkedIn and portfolio.', 'Personal', 'Medium', false, 16),
  todo(8, 'Fix login issue', 'Resolve authentication error in staging.', 'Work', 'High', false, 15),
  todo(9, 'Plan weekend trip', 'Book hotel and plan daily itinerary.', 'Personal', 'Low', true, 14),
  todo(10, 'Review pull requests', 'Review open PRs from the team.', 'Work', 'Medium', true, 13),
  todo(11, 'Send weekly report', 'Email the progress summary to the manager.', 'Work', 'Low', true, 12),
  todo(12, 'Upgrade dependencies', 'Bump npm packages and run the test suite.', 'Work', 'Medium', true, 11),
];
