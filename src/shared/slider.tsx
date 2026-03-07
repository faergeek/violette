import clsx from 'clsx';
import { useId } from 'react';

import css from './slider.module.css';

interface Marker {
  label: string;
  value: number;
}

interface Props {
  ariaLabelledby?: string;
  className?: string;
  id?: string;
  markers?: Marker[];
  max?: number;
  min?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
}

export function Slider({
  ariaLabelledby,
  className,
  id,
  markers,
  max,
  min,
  step,
  value,
  onValueChange,
}: Props) {
  const markersId = useId();

  return (
    <>
      <input
        aria-labelledby={ariaLabelledby}
        className={clsx(className, css.root)}
        id={id}
        list={markersId}
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={event => {
          if (!event.defaultPrevented) {
            onValueChange?.(event.currentTarget.valueAsNumber);
          }
        }}
      />

      {markers && markers.length !== 0 && (
        <datalist id={markersId}>
          {markers.map(marker => (
            <option
              key={marker.value}
              label={marker.label}
              value={marker.value}
            />
          ))}
        </datalist>
      )}
    </>
  );
}
