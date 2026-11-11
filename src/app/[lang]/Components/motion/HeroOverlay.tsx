import type { CSSProperties } from 'react';

export type HeroCard = { value?: string; text: string };

/**
 * Decorative copy that merges onto a detail page's hero photo while scrolling (motion.css).
 * It repeats visible page content, so assistive technology skips it.
 */
export default function HeroOverlay({ eyebrow, title, cards, dir }: {
  eyebrow: string; title: string; cards: HeroCard[]; dir: 'ltr' | 'rtl';
}) {
  const shown = cards.filter(card => card.text || card.value);
  return (
    <div data-hero-overlay="" aria-hidden="true" dir={dir} style={{ '--hero-card-count': shown.length } as CSSProperties}>
      <p data-hero-eyebrow="">{eyebrow}</p>
      <p data-hero-title="">{title}</p>
      {shown.length > 0 && <div data-hero-cards="">
        {shown.map((card, index) => <p data-hero-card="" key={index} style={{ '--hero-card-index': index } as CSSProperties}>
          {card.value && <strong>{card.value}</strong>}
          <span>{card.text}</span>
        </p>)}
      </div>}
    </div>
  );
}
