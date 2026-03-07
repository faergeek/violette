import clsx from 'clsx';

import css from './h1.module.css';

type Props = React.ComponentProps<'h1'>;

export function H1({ className, ...otherProps }: Props) {
  return <h1 className={clsx(className, css.root)} {...otherProps} />;
}
