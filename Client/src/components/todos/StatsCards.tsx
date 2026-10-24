import { CheckCircle2, Clock, Flame, ListTodo, type LucideIcon } from 'lucide-react';
import type { TodoStats } from '../../types/todo';

interface StatsCardsProps {
  stats: TodoStats | null;
}

interface Card {
  label: string;
  value: number | undefined;
  hint: string;
  tone: 'blue' | 'green' | 'amber' | 'purple';
  icon: LucideIcon;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const percentDone = stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const cards: Card[] = [
    { label: 'Total Todos', value: stats?.total, hint: 'All tasks', tone: 'blue', icon: ListTodo },
    { label: 'Completed', value: stats?.completed, hint: `${percentDone}% done`, tone: 'green', icon: CheckCircle2 },
    { label: 'Pending', value: stats?.pending, hint: 'Need attention', tone: 'amber', icon: Clock },
    { label: 'High Priority', value: stats?.highPriority, hint: 'Requires focus', tone: 'purple', icon: Flame },
  ];

  return (
    <section className="stats" aria-label="Summary">
      {cards.map(({ label, value, hint, tone, icon: Icon }) => (
        <article key={label} className={`stat stat--${tone}`}>
          <div className="stat__icon">
            <Icon size={24} />
          </div>
          <div>
            <div className="stat__label">{label}</div>
            <div className="stat__value">{value ?? '–'}</div>
            <div className="stat__hint">{hint}</div>
          </div>
        </article>
      ))}
    </section>
  );
}
