import type { Padding, Placement, Strategy } from '@floating-ui/dom';
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom';
import { cloneElement, useCallback, useEffect, useState } from 'react';

import { usePopoverContext } from './popover';

export default function PopoverContentEager({
  children,
  mainAxisOffset,
  padding,
  placement,
  strategy = 'absolute',
}: {
  children: React.ReactElement<{
    ref?: React.Ref<HTMLElement>;
    style?: React.CSSProperties;
    onToggle?: (event: React.ToggleEvent<HTMLElement>) => void;
  }>;
  mainAxisOffset?: number;
  padding?: Padding;
  placement?: Placement | undefined;
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
      middleware: [
        offset({ mainAxis: mainAxisOffset }),
        flip({ padding }),
        shift({ padding }),
        size({
          apply({ availableWidth, availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxWidth: `${Math.max(0, availableWidth)}px`,
              maxHeight: `${Math.max(0, availableHeight)}px`,
            });
          },
        }),
      ],
      placement,
      strategy,
    });

    setStyle({ position: strategy, left: x, top: y });
  }, [
    floating,
    isOpen,
    mainAxisOffset,
    padding,
    placement,
    reference,
    strategy,
  ]);

  useEffect(() => {
    updateStyle();

    if (!isOpen || !floating || !reference) return;
    return autoUpdate(reference, floating, updateStyle);
  }, [floating, isOpen, reference, updateStyle]);

  return cloneElement(children, {
    ref: node => {
      setFloating(node);

      const { ref } = children.props;

      if (ref) {
        if (typeof ref === 'function') {
          return ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    style: {
      ...children.props.style,
      ...(style ?? { visibility: 'hidden' }),
    },
    onToggle: event => {
      setIsOpen(event.newState === 'open');
      children.props.onToggle?.(event);
    },
  });
}
