import clsx from 'clsx';

import css from './label.module.css';

type Props = React.ComponentProps<'label'>;

export function Label({ className, ...otherProps }: Props) {
  return <label className={clsx(className, css.root)} {...otherProps} />;
}
