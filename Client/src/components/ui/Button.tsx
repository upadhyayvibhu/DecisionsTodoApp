import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  loadingLabel,
  className = '',
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, fullWidth && 'btn--full', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          {loadingLabel && <span>{loadingLabel}</span>}
        </>
      ) : children}
    </button>
  );
}
