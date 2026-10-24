import './Badge.css';

interface BadgeProps {
  value: string;
}

/** Colour is derived from the value: Work, Personal, High, Medium, Low, Pending, Completed. */
export default function Badge({ value }: BadgeProps) {
  return <span className={`badge badge--${value.toLowerCase()}`}>{value}</span>;
}
