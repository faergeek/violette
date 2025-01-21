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
import { cloneElement, useCallback, useEffect, useState } from 'react';

import { usePopoverContext } from './popover';

export default function PopoverContentEager({
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
