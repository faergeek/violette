import clsx from 'clsx';

import css from './input.module.css';

type Props = React.ComponentProps<'input'>;

export function Input({ className, ...otherProps }: Props) {
  return <input className={clsx(className, css.root)} {...otherProps} />;
}
