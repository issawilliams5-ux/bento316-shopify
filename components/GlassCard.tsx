'use client';
import { useEffect, useRef } from 'react';
import './GlassCard.css';

/**
 * The refraction tier probe, for JS that needs to branch on it.
 *
 * Do NOT ask for `backdrop-filter: url()` on its own: every engine answers
 * true, only Chromium renders it. `paint()` is a Chromium-only surface, so
 * pairing the two tracks what actually paints.
 */
export const supportsGlassRefraction = (): boolean =>
  typeof CSS !== 'undefined' &&
  CSS.supports('background', 'paint(gg-glass-probe)') &&
  CSS.supports('backdrop-filter', 'url(#gg-glass-probe)');

/**
 * A 420x280 liquid-glass card.
 *
 * The size is fixed on purpose: the displacement map is baked for that exact
 * box (see GlassFilterDefs, which must already be mounted in <body>). For the
 * same reason, never put the card under a scaled ancestor - backdrop-filter
 * samples before ancestor transforms - and never over a <canvas> or a playing
 * <video>, which composite on their own layer and so are invisible to the
 * backdrop.
 *
 * `data-glass-tier` reports, after mount, which tier this engine runs. It
 * describes the engine only: under prefers-reduced-transparency the card
 * paints opaque whatever it says.
 */
export function GlassCard({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current)
      ref.current.dataset.glassTier = supportsGlassRefraction() ? 'refraction' : 'fallback';
  }, []);
  return (
    <div ref={ref} className={className ? `gg-glass ${className}` : 'gg-glass'} {...rest}>
      {children}
      <span className="gg-glass__shine" aria-hidden="true" />
    </div>
  );
}
