import { createContext, useContext, useMemo, useState } from 'react';

interface QueueContextValue {
  isOpen: boolean;
  setIsOpen: (newIsOpen: boolean | ((prev: boolean) => boolean)) => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

export function useQueueContext() {
  const value = useContext(QueueContext);
  if (!value) throw new Error();
  return value;
}

export function QueueContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    (): QueueContextValue => ({ isOpen, setIsOpen }),
    [isOpen, setIsOpen],
  );

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function QueueContextConsumer({
  children,
}: {
  children: (value: QueueContextValue) => React.ReactNode;
}) {
  return children(useQueueContext());
}
