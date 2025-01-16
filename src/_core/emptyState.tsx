import { EarOff } from 'lucide-react';
import { cloneElement } from 'react';

import { H2 } from './headings';

export function EmptyState({
  icon = <EarOff />,
  message,
}: {
  icon?: React.ReactElement<{ className: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center text-muted-foreground">
      {cloneElement(icon, { className: 'size-14' })}

      <H2 className="text-xl">{message}</H2>
    </div>
  );
}
