import clsx from 'clsx';
import { createContext, useContext, useId, useMemo } from 'react';

import { Label as BaseLabel } from './label';
import css from './radioGroup.module.css';

const Context = createContext<{
  defaultValue?: string;
  id: string;
  name?: string;
  value?: string;
} | null>(null);

function useRadioGroupContext() {
  const value = useContext(Context);

  if (!value) {
    throw new Error('RadioGroup components must be used within Root');
  }

  return value;
}

export function Root({
  children,
  className,
  defaultValue,
  name,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const id = useId();

  const contextValue = useMemo(
    () => ({ defaultValue, id, name, value }),
    [defaultValue, id, name, value],
  );

  return (
    <Context.Provider value={contextValue}>
      <div
        aria-labelledby={id}
        className={clsx(className, css.root)}
        role="radiogroup"
        onChange={event => {
          if (!(event.target instanceof HTMLInputElement)) return;

          onValueChange?.(event.target.checked ? event.target.value : '');
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { id } = useRadioGroupContext();

  return (
    <BaseLabel className={className} id={id}>
      {children}
    </BaseLabel>
  );
}

export function Item({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value?: string;
}) {
  const context = useRadioGroupContext();

  return (
    <BaseLabel className={css.label}>
      <input
        checked={
          context.value != null && value != null
            ? context.value === value
            : undefined
        }
        className={clsx(className, css.input)}
        defaultChecked={
          context.defaultValue != null && value != null
            ? context.defaultValue === value
            : undefined
        }
        name={context.name}
        type="radio"
        value={value}
        onChange={() => {}}
      />

      {label}
    </BaseLabel>
  );
}
