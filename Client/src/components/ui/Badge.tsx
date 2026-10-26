import './Badge.css';

interface BadgeProps {
  value: string;
  categoryId?: number;
}

const CATEGORY_COLORS = ['blue', 'violet', 'orange', 'teal', 'pink', 'indigo'];

/** A category keeps its palette colour because its database ID does not change. */
const getCategoryColor = (categoryId: number): string =>
  CATEGORY_COLORS[(categoryId - 1) % CATEGORY_COLORS.length];

/** Colour is derived from the category ID or from the value for priority and status badges. */
export default function Badge({ value, categoryId }: BadgeProps) {
  const colorClass = categoryId
    ? `badge--category-${getCategoryColor(categoryId)}`
    : `badge--${value.toLowerCase()}`;

  return <span className={`badge ${colorClass}`}>{value}</span>;
}
