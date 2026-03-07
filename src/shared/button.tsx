import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

import css from './button.module.css';

interface Props extends React.ComponentProps<'button'> {
  loading?: boolean;
  variant?: 'icon' | 'primary';
}

export function Button({
  className,
  loading,
  variant = 'primary',
  children,
  type = 'button',
  ...otherProps
}: Props) {
  return (
    <button
      className={clsx(
        className,
        css.root,
        {
          icon: css.root_variant_icon,
          primary: css.root_variant_primary,
        }[variant],
        {
          [css.root_state_loading]: loading,
        },
      )}
      type={type}
      {...otherProps}
    >
      {loading ? <Loader2 className={css.spinner} /> : null}
      <span className={css.contents}>{children}</span>
    </button>
  );
}
