import clsx from 'clsx';

import css from './container.module.css';

type Props = React.ComponentProps<'div'>;

export function Container({ className, ...otherProps }: Props) {
  return <div className={clsx(className, css.root)} {...otherProps} />;
}
