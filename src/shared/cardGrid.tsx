import css from './cardGrid.module.css';

export const card_grid_cover_art_sizes =
  '(max-width: 639px) calc((100vw - 12px) / 2), (max-width: 767px) 143px, (max-width: 1023px) 137.6px, (max-width: 1279px) 155.333px, (max-width: 1535px) 168px, 177.5px';

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className={css.root}>{children}</div>;
}
