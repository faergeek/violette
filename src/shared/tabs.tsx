import clsx from 'clsx';
import { cloneElement, createContext, useContext, useMemo } from 'react';

import css from './tabs.module.css';

const Context = createContext<{ value: string } | null>(null);

function useTabsContext() {
  const value = useContext(Context);

  if (!value) {
    throw new Error('Tabs components must be used within Root');
  }

  return value;
}

export function Root({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  const contextValue = useMemo(() => ({ value }), [value]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

export function List({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(className, css.list)}
      role="tablist"
      onKeyDown={event => {
        if (!(event.target instanceof Element)) return;

        const focusedTab =
          event.target.role === 'tab'
            ? event.target
            : event.target.closest('[role=tab]');

        if (!focusedTab) return;

        const tablist = event.currentTarget;

        switch (event.code) {
          case 'Home': {
            event.preventDefault();
            const tab = tablist.querySelector('[role=tab]:first-child');
            if (tab instanceof HTMLElement) tab.focus();
            break;
          }
          case 'ArrowLeft': {
            event.preventDefault();
            const tabs = Array.from(tablist.querySelectorAll('[role=tab]'));
            const currentIndex = tabs.indexOf(focusedTab);
            const len = tabs.length;
            const nextIndex = (currentIndex + len - 1) % len;
            const tab = tabs[nextIndex];
            if (tab instanceof HTMLElement) tab.focus();
            break;
          }
          case 'ArrowRight': {
            event.preventDefault();
            const tabs = Array.from(tablist.querySelectorAll('[role=tab]'));
            const currentIndex = tabs.indexOf(focusedTab);
            const len = tabs.length;
            const nextIndex = (currentIndex + 1) % len;
            const tab = tabs[nextIndex];
            if (tab instanceof HTMLElement) tab.focus();
            break;
          }
          case 'End': {
            event.preventDefault();
            const tab = tablist.querySelector('[role=tab]:last-child');
            if (tab instanceof HTMLElement) tab.focus();
            break;
          }
          case 'Space':
            event.preventDefault();
            if (focusedTab instanceof HTMLElement) focusedTab.click();
            break;
        }
      }}
    >
      {children}
    </div>
  );
}

export function Trigger({
  children,
  value,
}: {
  children: React.ReactElement<{
    'aria-selected'?: boolean;
    className?: string;
    role?: React.AriaRole;
    tabIndex: number;
  }>;
  value: string;
}) {
  const contextValue = useTabsContext();
  const isSelected = value === contextValue.value;

  return cloneElement(children, {
    'aria-selected': isSelected,
    className: clsx(children.props.className, css.trigger),
    role: 'tab',
    tabIndex: isSelected ? 0 : -1,
  });
}

export function Content({
  children,
  className,
  value,
}: {
  children?: React.ReactNode;
  className?: string;
  value?: string;
}) {
  const contextValue = useTabsContext();

  return (
    <div
      className={clsx(className, css.content)}
      role="tabpanel"
      style={value === contextValue.value ? undefined : { display: 'none' }}
    >
      {children}
    </div>
  );
}
