import { EarOff } from 'lucide-react';
import { cloneElement } from 'react';

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

      <h2 className="text-xl">{message}</h2>
    </div>
  );
}
