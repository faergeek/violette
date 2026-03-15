import clsx from 'clsx';

import css from './h2.module.css';

type Props = React.ComponentProps<'h2'>;

export function H2({ className, ...otherProps }: Props) {
  return <h2 className={clsx(className, css.root)} {...otherProps} />;
}
