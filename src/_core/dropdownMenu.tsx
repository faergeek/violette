import type { Placement, Strategy } from '@floating-ui/dom';
import { invariant } from '@tanstack/react-router';
import clsx from 'clsx';
import {
  cloneElement,
  createContext,
  useContext,
  useId,
  useMemo,
  useRef,
} from 'react';

import { Popover, PopoverContent, PopoverReference } from './popover';

interface DropdownMenuContentContextValue {
  isOpenRef: React.RefObject<boolean>;
  menuId: string;
  preventNextToggleRef: React.RefObject<boolean>;
  triggerId: string;
}

const DropdownMenuContext =
  createContext<DropdownMenuContentContextValue | null>(null);

const useDropdownMenuContext = () => {
  const value = useContext(DropdownMenuContext);
  invariant(value);
  return value;
};

export function DropdownMenu(props: React.ComponentProps<typeof Popover>) {
  const isOpenRef = useRef(false);
  const menuId = useId();
  const preventNextToggleRef = useRef(false);
  const triggerId = useId();

  const contextValue = useMemo(
    (): DropdownMenuContentContextValue => ({
      isOpenRef,
      menuId,
      preventNextToggleRef,
      triggerId,
    }),
    [menuId, triggerId],
  );

  return (
    <DropdownMenuContext value={contextValue}>
      <Popover {...props} />
    </DropdownMenuContext>
  );
}

export function DropdownMenuTrigger({
  children,
  ...otherProps
}: React.ComponentProps<typeof PopoverReference> & {
  children: React.ReactElement<{
    'aria-controls'?: string;
    'aria-haspopup'?: React.AriaRole;
    id?: string;
    popoverTarget?: string;
    onPointerDown?: () => void;
  }>;
}) {
  const { isOpenRef, menuId, preventNextToggleRef, triggerId } =
    useDropdownMenuContext();

  return (
    <PopoverReference {...otherProps}>
      {cloneElement(children, {
        'aria-controls': menuId,
        'aria-haspopup': 'menu',
        id: triggerId,
        popoverTarget: menuId,
        onPointerDown: () => {
          if (isOpenRef.current) {
            preventNextToggleRef.current = true;
          }
        },
      })}
    </PopoverReference>
  );
}

export function DropdownMenuContent({
  className,
  placement,
  strategy,
  ...otherProps
}: Omit<
  React.ComponentProps<'div'>,
  'aria-labelledby' | 'id' | 'popover' | 'role'
> & {
  placement?: Placement | undefined;
  strategy?: Strategy | undefined;
}) {
  const { isOpenRef, menuId, preventNextToggleRef, triggerId } =
    useDropdownMenuContext();

  return (
    <PopoverContent placement={placement} strategy={strategy}>
      <div
        {...otherProps}
        aria-labelledby={triggerId}
        className={clsx(
          'm-0 origin-top-right rounded-md border bg-background p-1 shadow-md [&:popover-open]:animate-in [&:popover-open]:fade-in-0 [&:popover-open]:zoom-in-95 [&:popover-open]:slide-in-from-top-2',
          className,
        )}
        id={menuId}
        popover="auto"
        role="menu"
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.hidePopover();
          }
        }}
        onKeyDown={event => {
          const selectedMenuItem =
            event.target instanceof HTMLElement ||
            event.target instanceof SVGElement
              ? event.target.role === 'menuitem'
                ? event.target
                : event.target.closest('[role=menuitem]')
              : null;

          if (!selectedMenuItem || !(selectedMenuItem instanceof HTMLElement)) {
            return;
          }

          const menu = event.currentTarget;

          switch (event.code) {
            case 'Home': {
              event.preventDefault();
              event.stopPropagation();
              const menuItem = menu.querySelector(
                '[role=menuitem]:first-child',
              );
              invariant(menuItem instanceof HTMLElement);
              menuItem.focus();
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
              const menuItem =
                menuItems[
                  (currentIndex + menuItems.length - 1) % menuItems.length
                ];
              invariant(menuItem instanceof HTMLElement);
              menuItem.focus();
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
              const menuItem = menuItems[(currentIndex + 1) % menuItems.length];
              invariant(menuItem instanceof HTMLElement);
              menuItem.focus();
              break;
            }
            case 'End': {
              event.preventDefault();
              event.stopPropagation();
              const menuItem = menu.querySelector('[role=menuitem]:last-child');
              invariant(menuItem instanceof HTMLElement);
              menuItem.focus();
              break;
            }
            case 'Escape': {
              event.preventDefault();
              event.stopPropagation();
              const trigger = document.getElementById(triggerId);
              invariant(trigger instanceof HTMLElement);
              trigger.focus();
              break;
            }
            default:
              if (Array.from(event.key).length === 1) {
                event.preventDefault();
                event.stopPropagation();

                const pressedCharacter = event.key.toLowerCase();
                const menuItems = Array.from(
                  menu.querySelectorAll('[role=menuitem]'),
                );
                const currentIndex = menuItems.indexOf(selectedMenuItem);

                let menuItemToFocus: HTMLElement | undefined;
                for (
                  let i = currentIndex + 1;
                  i < currentIndex + menuItems.length;
                  i++
                ) {
                  const wrappedI = i % menuItems.length;
                  const menuItem = menuItems[wrappedI];

                  if (
                    menuItem.textContent
                      ?.toLowerCase()
                      ?.startsWith(pressedCharacter)
                  ) {
                    invariant(menuItem instanceof HTMLElement);
                    menuItemToFocus = menuItem;
                    break;
                  }
                }

                menuItemToFocus?.focus();
              }
              break;
          }
        }}
        onBeforeToggle={event => {
          if (event.newState === 'open' && preventNextToggleRef.current) {
            preventNextToggleRef.current = false;
            event.preventDefault();
          }
        }}
        onToggle={event => {
          isOpenRef.current = event.newState === 'open';

          if (event.newState === 'open') {
            const menu = event.currentTarget;
            const firstMenuItem = menu.querySelector(
              '[role=menuitem]:first-child',
            );
            invariant(firstMenuItem instanceof HTMLElement);
            setTimeout(() => {
              firstMenuItem.focus();
            }, 0);
          }
        }}
      />
    </PopoverContent>
  );
}

export function DropdownMenuItem({
  className,
  ...otherProps
}: React.ComponentProps<'button'>) {
  const { menuId } = useDropdownMenuContext();

  return (
    <button
      className={clsx(
        'flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      popoverTarget={menuId}
      popoverTargetAction="hide"
      role="menuitem"
      type="button"
      {...otherProps}
    />
  );
}
