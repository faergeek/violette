import type { Placement, Strategy } from '@floating-ui/dom';
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom';
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const PopoverContext = createContext<{
  reference: HTMLElement | null;
  setReference: (newReference: HTMLElement | null) => void;
} | null>(null);

function usePopoverContext() {
  const value = useContext(PopoverContext);

  if (!value) {
    throw new Error('Popover components must be used within Root');
  }

  return value;
}

export function Root({ children }: { children: React.ReactNode }) {
  const [reference, setReference] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ reference, setReference }), [reference]);

  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
}

export function Reference({
  children,
}: {
  children: React.ReactElement<React.ComponentProps<'div'>>;
}) {
  const { setReference } = usePopoverContext();

  return cloneElement(children, { ref: setReference });
}

export function Content({
  children,
  mainAxisOffset,
  padding,
  placement,
  strategy = 'absolute',
}: {
  children: React.ReactElement<{
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties;
    onToggle: (event: ToggleEvent) => void;
  }>;
  mainAxisOffset?: number;
  padding?: number;
  placement?: Placement;
  strategy?: Strategy;
}) {
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const { reference } = usePopoverContext();
  const [isOpen, setIsOpen] = useState(false);

  const [style, setStyle] = useState<React.CSSProperties>({
    visibility: 'hidden',
  });

  useEffect(() => {
    if (!isOpen || !floating || !reference) return;

    return autoUpdate(
      reference,
      floating,
      async () => {
        const { x, y } = await computePosition(reference, floating, {
          placement,
          strategy,
          middleware: [
            offset({ mainAxis: mainAxisOffset }),
            flip({ padding }),
            shift({ padding }),
            size({
              apply: ({ availableWidth, availableHeight, elements }) => {
                const floatingElement = elements.floating as HTMLElement | null;

                if (!floatingElement) {
                  return;
                }

                const setProp = (name: string, value: string) => {
                  floatingElement.style.setProperty(name, value, '');
                };

                setProp('max-width', `${Math.max(0, availableWidth)}px`);
                setProp('max-height', `${Math.max(0, availableHeight)}px`);
              },
            }),
          ],
        });

        setStyle({ position: strategy, left: x, top: y });
      },
      {
        animationFrame: true,
      },
    );
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
    if (!floating) return;

    const abortController = new AbortController();

    floating.addEventListener(
      'toggle',
      event => {
        setIsOpen(event.newState === 'open');
        children.props.onToggle?.(event);
      },
      {
        signal: abortController.signal,
        passive: true,
      },
    );

    return () => {
      abortController.abort();
    };
  }, [children.props, floating]);

  return cloneElement(children, {
    ref: node => {
      setFloating(node);

      if (typeof children.props.ref === 'function') {
        children.props.ref(node);
      } else if (children.props.ref) {
        // TODO: reimplement popovers in a way that completely avoids this
        // issue once migration is done
        // eslint-disable-next-line react-hooks/immutability
        children.props.ref.current = node;
      }
    },
    style: {
      ...children.props.style,
      ...style,
    },
  });
}
