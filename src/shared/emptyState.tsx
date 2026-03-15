import { EarOff } from 'lucide-react';
import { cloneElement } from 'react';

import css from './emptyState.module.css';
import { H2 } from './h2';

type Props = {
  icon?: React.ReactElement<{ className: string }>;
  message: string;
};

export function EmptyState({ icon = <EarOff />, message }: Props) {
  return (
    <div className={css.root}>
      {cloneElement(icon, { className: css.icon })}
      <H2 className={css.text}>{message}</H2>
    </div>
  );
}
