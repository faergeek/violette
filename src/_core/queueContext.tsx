import { invariant } from '@tanstack/react-router';
import { createContext, useContext, useMemo, useState } from 'react';

interface QueueContextValue {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean | ((prevIsOpen: boolean) => boolean)) => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

export function QueueContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    (): QueueContextValue => ({ isOpen, setIsOpen }),
    [isOpen],
  );

  return <QueueContext value={value}>{children}</QueueContext>;
}

export function useQueueContext() {
  const value = useContext(QueueContext);
  invariant(value);
  return value;
}

export function QueueContextConsumer({
  children,
}: {
  children: (value: QueueContextValue) => React.ReactNode;
}) {
  return children(useQueueContext());
}
