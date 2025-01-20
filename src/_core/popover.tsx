import type {
  OffsetOptions,
  Placement,
  ShiftOptions,
  Strategy,
} from '@floating-ui/dom';
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { invariant } from '@tanstack/react-router';
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
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

function usePopoverContext() {
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

export function PopoverContent({
  children,
  offsetOptions,
  placement,
  shiftOptions,
  strategy = 'absolute',
}: {
  children: React.ReactElement<{
    ref: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    onToggle: (event: React.ToggleEvent<HTMLElement>) => void;
  }>;
  offsetOptions?: OffsetOptions;
  placement?: Placement | undefined;
  shiftOptions?: ShiftOptions;
  strategy?: Strategy | undefined;
}) {
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const { reference } = usePopoverContext();
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>();

  const updateStyle = useCallback(async () => {
    if (!isOpen || !floating || !reference) {
      setStyle(undefined);
      return;
    }

    const { x, y } = await computePosition(reference, floating, {
      middleware: [offset(offsetOptions), flip(), shift(shiftOptions)],
      placement,
      strategy,
    });

    setStyle({ position: strategy, left: x, top: y });
  }, [
    floating,
    isOpen,
    offsetOptions,
    placement,
    reference,
    shiftOptions,
    strategy,
  ]);

  useEffect(() => {
    updateStyle();

    if (!isOpen || !floating || !reference) return;
    return autoUpdate(reference, floating, updateStyle);
  }, [floating, isOpen, reference, updateStyle]);

  return cloneElement(children, {
    ref: setFloating,
    style: {
      ...children.props.style,
      ...(style ?? { visibility: 'hidden' }),
    },
    onToggle: event => {
      setIsOpen(event.newState === 'open');
    },
  });
}
