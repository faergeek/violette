import clsx from 'clsx';
import { useId } from 'react';

export function Slider({
  className,
  markers,
  onValueChange,
  ...otherProps
}: React.ComponentProps<'input'> & {
  markers?: Array<number | { label?: string; value: number }>;
  onValueChange?: (newValue: number) => void;
}) {
  const markersId = useId();

  return (
    <>
      <input
        className={clsx('w-full', className)}
        list={otherProps.list ?? markersId}
        type="range"
        {...otherProps}
        onChange={event => {
          otherProps.onChange?.(event);

          if (!event.defaultPrevented) {
            onValueChange?.(event.currentTarget.valueAsNumber);
          }
        }}
      />

      {markers && markers.length !== 0 && (
        <datalist id={markersId}>
          {markers.map(marker => {
            const value = typeof marker === 'number' ? marker : marker.value;

            return (
              <option
                key={value}
                label={typeof marker === 'number' ? undefined : marker.label}
                value={value}
              />
            );
          })}
        </datalist>
      )}
    </>
  );
}
