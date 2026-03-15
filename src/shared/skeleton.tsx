import clsx from 'clsx';

import css from './skeleton.module.css';

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: Props) {
  return <span className={clsx(className, css.root)} style={style} />;
}
