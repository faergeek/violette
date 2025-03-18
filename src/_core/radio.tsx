import { invariant } from '@tanstack/react-router';
import clsx from 'clsx';
import { createContext, useContext, useId, useMemo } from 'react';

import { Label } from './label';

interface RadioGroupContextValue {
  defaultValue: string | undefined;
  id: string;
  name: string | undefined;
  value: string | undefined;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function RadioGroup({
  children,
  className,
  defaultValue,
  name,
  value,
  onValueChange,
  ...otherProps
}: React.ComponentProps<'div'> & {
  defaultValue?: string;
  name?: string;
  value?: string;
  onValueChange?: (newValue: string) => void;
}) {
  const id = useId();

  const contextValue = useMemo(
    (): RadioGroupContextValue => ({ defaultValue, id, name, value }),
    [defaultValue, id, name, value],
  );

  return (
    <RadioGroupContext value={contextValue}>
      <div
        aria-labelledby={id}
        className={clsx('flex flex-wrap items-center gap-2', className)}
        role="radiogroup"
        onChange={event => {
          const item = event.target;
          if (!(item instanceof HTMLInputElement)) return;

          onValueChange?.(item.checked ? item.value : '');
        }}
        {...otherProps}
      >
        {children}
      </div>
    </RadioGroupContext>
  );
}

function useRadioGroupContext() {
  const value = useContext(RadioGroupContext);
  invariant(value);
  return value;
}

export function RadioGroupLabel(props: React.ComponentProps<'label'>) {
  const { id } = useRadioGroupContext();

  return <Label id={id} {...props} />;
}

export function RadioGroupItem({
  className,
  label,
  value,
  ...otherProps
}: Omit<React.ComponentProps<'input'>, 'checked' | 'defaultChecked'> & {
  label: React.ReactNode;
}) {
  const contextValue = useRadioGroupContext();

  return (
    <Label className="flex cursor-pointer items-center gap-2">
      <input
        checked={
          contextValue.value === undefined
            ? undefined
            : value === contextValue.value
        }
        className={clsx(
          'focus-visible:ring-ring flex aspect-square h-4 w-4 cursor-[inherit] appearance-none items-center justify-center rounded-full border border-primary text-primary ring-offset-background before:h-2 before:w-2 before:scale-0 before:rounded-full before:bg-primary before:transition-transform checked:before:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        defaultChecked={
          contextValue.defaultValue === undefined
            ? undefined
            : value === contextValue.defaultValue
        }
        name={contextValue.name}
        type="radio"
        value={value}
        onChange={() => {}}
        {...otherProps}
      />

      {label}
    </Label>
  );
}
