import { invariant } from '@tanstack/react-router';
import clsx from 'clsx';
import { cloneElement, createContext, useContext, useMemo } from 'react';

interface TabsContextValue {
  value: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  const contextValue = useMemo((): TabsContextValue => ({ value }), [value]);

  return <TabsContext value={contextValue}>{children}</TabsContext>;
}

function useTabsContext() {
  const value = useContext(TabsContext);
  invariant(value);
  return value;
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'flex max-w-full items-center space-x-2 overflow-auto p-1 text-sm font-bold text-muted-foreground',
        className,
      )}
      role="tablist"
      onKeyDown={event => {
        const selectedTab =
          event.target instanceof HTMLElement ||
          event.target instanceof SVGElement
            ? event.target.role === 'tab'
              ? event.target
              : event.target.closest('[role=tab]')
            : null;

        if (!selectedTab || !(selectedTab instanceof HTMLElement)) {
          return;
        }

        const tablist = event.currentTarget;

        switch (event.code) {
          case 'Home': {
            event.preventDefault();
            const newTab = tablist.querySelector('[role=tab]:first-child');
            invariant(newTab instanceof HTMLElement);
            newTab.focus();
            break;
          }
          case 'ArrowLeft': {
            event.preventDefault();
            const tabs = Array.from(tablist.querySelectorAll('[role=tab]'));
            const currentIndex = tabs.indexOf(selectedTab);
            const newTab = tabs[(currentIndex + tabs.length - 1) % tabs.length];
            invariant(newTab instanceof HTMLElement);
            newTab.focus();
            break;
          }
          case 'ArrowRight': {
            event.preventDefault();
            const tabs = Array.from(tablist.querySelectorAll('[role=tab]'));
            const currentIndex = tabs.indexOf(selectedTab);
            const newTab = tabs[(currentIndex + 1) % tabs.length];
            invariant(newTab instanceof HTMLElement);
            newTab.focus();
            break;
          }
          case 'End': {
            event.preventDefault();
            const newTab = tablist.querySelector('[role=tab]:last-child');
            invariant(newTab instanceof HTMLElement);
            newTab.focus();
            break;
          }
          case 'Space':
            event.preventDefault();
            selectedTab.click();
            break;
        }
      }}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  children,
  value,
}: {
  children: React.ReactElement<{
    'aria-selected': boolean;
    className: string;
    role: React.AriaRole | undefined;
    tabIndex: number;
    onKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void;
  }>;
  value: string;
}) {
  const contextValue = useTabsContext();
  const isSelected = value === contextValue.value;

  return cloneElement(children, {
    'aria-selected': isSelected,
    className: clsx(
      'whitespace-nowrap border-b-2 border-transparent tracking-widest [font-variant-caps:all-small-caps] aria-selected:border-primary aria-selected:text-foreground',
      children.props.className,
    ),
    role: 'tab',
    tabIndex: isSelected ? 0 : -1,
  });
}

export function TabsContent({
  className,
  value,
  ...otherProps
}: Omit<React.ComponentProps<'div'>, 'hidden'> & {
  value: string;
}) {
  const contextValue = useTabsContext();

  return (
    <div
      {...otherProps}
      className={clsx('mt-2', className)}
      hidden={value !== contextValue.value}
      role="tabpanel"
    />
  );
}
