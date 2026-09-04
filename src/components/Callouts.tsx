import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { registerAnchor, setAnchorClip, unregisterAnchor } from '../village/anchors';
import { useStore } from '../state/store';
import { useIsMobile } from '../lib/hooks';
import type { Vec3 } from '../lib/types';

export type CalloutItem = {
  id: string;
  position: Vec3;
  label: string;
  emoji?: string;
  tone?: 'plain' | 'teal' | 'clay';
  offsetY?: number;
  onClick?: () => void;
  /** Hide the label until the village actually contains this activity. */
  appearsIn?: number;
  /**
   * Keep this label on phones. Everything else is dropped there — a small world with
   * eight chips over it is unreadable, and the narrative sheet carries the same names.
   */
  keepOnMobile?: boolean;
};

/**
 * HTML labels pinned to points in the 3D village.
 *
 * Rendered as real DOM in a layer above the canvas — never as textures inside WebGL —
 * so the text stays crisp, selectable and available to assistive technology.
 */
function Callout({ item }: { item: CalloutItem }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerAnchor(item.id, el, item.position, item.offsetY ?? 6);
    return () => unregisterAnchor(item.id);
  }, [item.id, item.position, item.offsetY]);

  const inner = (
    <span className="callout-inner">
      {item.emoji && <span aria-hidden="true">{item.emoji}</span>}
      {item.label}
    </span>
  );

  return (
    <div ref={ref} className="callout" data-tone={item.tone ?? 'plain'} style={{ pointerEvents: item.onClick ? 'auto' : 'none' }}>
      {item.onClick ? (
        <button type="button" onClick={item.onClick} style={{ all: 'unset', cursor: 'pointer' }}>
          {inner}
        </button>
      ) : (
        inner
      )}
    </div>
  );
}

export function WorldCallouts({ items }: { items: CalloutItem[] }) {
  const ready = useStore((s) => s.villageReady);
  const mode = useStore((s) => s.mode);
  useNarrativeClip(mode === 'stage');
  const year = useStore((s) => s.year);
  const mobile = useIsMobile();
  if (!ready || mode === 'hidden') return null;
  const visible = items.filter(
    (i) => (i.appearsIn === undefined || year >= i.appearsIn - 0.4) && (!mobile || i.keepOnMobile),
  );

  // Portalled to <body>: the narrative panel uses backdrop-filter, and a filtered
  // ancestor turns position:fixed descendants into position:absolute, which would trap
  // every label inside the story column.
  return createPortal(
    <div className="callout-layer" aria-hidden="true">
      {visible.map((item) => (
        <Callout key={item.id} item={item} />
      ))}
    </div>,
    document.body,
  );
}

/** Keeps the label clip in step with the actual width of the story column. */
function useNarrativeClip(active: boolean) {
  useLayoutEffect(() => {
    if (!active) {
      setAnchorClip(0);
      return;
    }
    const measure = () => {
      const el = document.querySelector('.narrative');
      const stacked = window.matchMedia('(max-width: 860px)').matches;
      setAnchorClip(!el || stacked ? 0 : el.getBoundingClientRect().right);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      setAnchorClip(0);
    };
  }, [active]);
}
