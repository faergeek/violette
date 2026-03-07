import type { Placement, Strategy } from '@floating-ui/dom';
import clsx from 'clsx';
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';

import css from './dropdownMenu.module.css';
import {
  Content as PopoverContent,
  Reference as PopoverReference,
  Root as PopoverRoot,
} from './popover';

const DropdownMenuContext = createContext<{
  isOpenRef: React.RefObject<boolean>;
  menuId: string;
  preventNextToggleRef: React.RefObject<boolean>;
  triggerId: string;
} | null>(null);

function useDropdownMenuContext() {
  const value = useContext(DropdownMenuContext);

  if (!value) {
    throw new Error('DropdownMenu components must be used within Root');
  }

  return value;
}

export function Root({ children }: { children: React.ReactNode }) {
  const isOpenRef = useRef(false);
  const menuId = useId();
  const preventNextToggleRef = useRef(false);
  const triggerId = useId();

  const value = useMemo(
    () => ({ isOpenRef, menuId, preventNextToggleRef, triggerId }),
    [menuId, triggerId],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <PopoverRoot>{children}</PopoverRoot>
    </DropdownMenuContext.Provider>
  );
}

export function Trigger({
  children,
}: {
  children: React.ReactElement<React.ComponentProps<'div'>>;
}) {
  const { isOpenRef, menuId, preventNextToggleRef, triggerId } =
    useDropdownMenuContext();

  return (
    <PopoverReference>
      {
        // eslint-disable-next-line react-hooks/refs
        cloneElement(children, {
          'aria-controls': menuId,
          'aria-haspopup': 'menu',
          id: triggerId,
          popoverTarget: menuId,
          onPointerDown: () => {
            if (isOpenRef.current) {
              preventNextToggleRef.current = true;
            }
          },
        })
      }
    </PopoverReference>
  );
}

export function Content({
  children,
  className,
  placement,
  strategy,
}: {
  children: React.ReactNode;
  className?: string;
  placement?: Placement;
  strategy?: Strategy;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { isOpenRef, menuId, preventNextToggleRef, triggerId } =
    useDropdownMenuContext();

  useEffect(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return;

    const abortController = new AbortController();

    menuEl.addEventListener(
      'beforetoggle',
      event => {
        if (event.newState === 'open' && preventNextToggleRef.current) {
          preventNextToggleRef.current = false;
          event.preventDefault();
        }
      },
      { signal: abortController.signal },
    );

    return () => {
      abortController.abort();
    };
  }, [preventNextToggleRef]);

  return (
    <PopoverContent placement={placement} strategy={strategy}>
      <div
        aria-labelledby={triggerId}
        className={clsx(className, css.root)}
        id={menuId}
        popover="auto"
        ref={menuRef}
        role="menu"
        onBlur={event => {
          if (
            !(
              event.relatedTarget &&
              event.currentTarget.contains(event.relatedTarget)
            )
          ) {
            event.currentTarget.hidePopover();
          }
        }}
        onKeyDown={event => {
          const selectedMenuItem =
            event.target instanceof HTMLElement
              ? event.target.role === 'menuitem'
                ? event.target
                : event.target.closest('[role=menuitem]')
              : null;

          if (!selectedMenuItem) return;

          const menu = event.currentTarget;

          switch (event.code) {
            case 'Home': {
              event.preventDefault();
              event.stopPropagation();
              const item = menu.querySelector('[role=menuitem]:first-child');
              if (item instanceof HTMLElement) item.focus();
              break;
            }
            case 'ArrowLeft':
            case 'ArrowUp': {
              event.preventDefault();
              event.stopPropagation();
              const menuItems = Array.from(
                menu.querySelectorAll('[role=menuitem]'),
              );
              const currentIndex = menuItems.indexOf(selectedMenuItem);
              const len = menuItems.length;
              const nextIndex = (currentIndex + len - 1) % len;
              const item = menuItems[nextIndex];
              if (item instanceof HTMLElement) item.focus();
              break;
            }
            case 'ArrowRight':
            case 'ArrowDown': {
              event.preventDefault();
              event.stopPropagation();
              const menuItems = Array.from(
                menu.querySelectorAll('[role=menuitem]'),
              );
              const currentIndex = menuItems.indexOf(selectedMenuItem);
              const len = menuItems.length;
              const nextIndex = (currentIndex + 1) % len;
              const item = menuItems[nextIndex];
              if (item instanceof HTMLElement) item.focus();
              break;
            }
            case 'End': {
              event.preventDefault();
              event.stopPropagation();
              const item = menu.querySelector('[role=menuitem]:last-child');
              if (item instanceof HTMLElement) item.focus();
              break;
            }
            case 'Escape': {
              event.preventDefault();
              event.stopPropagation();
              const trigger = document.getElementById(triggerId);
              if (trigger instanceof HTMLElement) trigger.focus();
              break;
            }
            default:
              if (event.key.length === 1) {
                event.preventDefault();
                event.stopPropagation();

                const menuItems = Array.from(
                  menu.querySelectorAll('[role=menuitem]'),
                );

                const currentIndex = menuItems.indexOf(selectedMenuItem);

                const item = menuItems
                  .slice(currentIndex + 1)
                  .concat(menuItems.slice(0, currentIndex))
                  .find(x =>
                    x.textContent
                      .toLowerCase()
                      .startsWith(event.key.toLowerCase()),
                  );

                if (item instanceof HTMLElement) item.focus();
              }
          }
        }}
        onToggle={event => {
          isOpenRef.current = event.newState === 'open';
          if (event.newState !== 'open') return;

          const currentTarget = event.currentTarget;
          if (!currentTarget) return;

          const firstMenuItem = currentTarget.querySelector<HTMLElement>(
            '[role=menuitem]:first-child',
          );

          if (!firstMenuItem) return;

          setTimeout(() => {
            firstMenuItem.focus();
          }, 0);
        }}
      >
        {children}
      </div>
    </PopoverContent>
  );
}

export function Item({
  className,
  type = 'button',
  ...otherProps
}: React.ComponentProps<'button'> & {
  type?: 'button' | 'submit' | 'reset';
}) {
  const { menuId } = useDropdownMenuContext();

  return (
    <button
      className={clsx(className, css.item)}
      popoverTarget={menuId}
      popoverTargetAction="hide"
      role="menuitem"
      type={type}
      {...otherProps}
    />
  );
}
