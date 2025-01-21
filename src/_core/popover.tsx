import { invariant } from '@tanstack/react-router';
import {
  cloneElement,
  createContext,
  lazy,
  useContext,
  useMemo,
  useState,
} from 'react';

interface PopoverContextValue {
  reference: HTMLElement | null;
  setReference: (el: HTMLElement | null) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function Popover({ children }: { children: React.ReactNode }) {
  const [reference, setReference] = useState<HTMLElement | null>(null);

  const contextValue = useMemo(
    (): PopoverContextValue => ({
      reference,
      setReference,
    }),
    [reference],
  );

  return <PopoverContext value={contextValue}>{children}</PopoverContext>;
}

export function usePopoverContext() {
  const value = useContext(PopoverContext);
  invariant(value);
  return value;
}

export function PopoverReference({
  children,
}: {
  children: React.ReactElement<{ ref: React.RefCallback<HTMLElement> }>;
}) {
  const { setReference } = usePopoverContext();

  return cloneElement(children, { ref: setReference });
}

export const PopoverContent = lazy(() => import('./popoverContent'));
