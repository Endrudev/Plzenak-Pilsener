import { useEffect, useMemo, useState } from 'react';

/**
 * SVG uvnitř scén používá id (gradienty, filtry, masky). Kdybys stejnou scénu
 * vykreslil dvakrát (hero + karta), id by se srazila a druhá kopie by mohla
 * kreslit gradient té první. Proto každé instanci přidáme vlastní příponu.
 */
export function scopeIds(html, suffix) {
  const ids = new Set();
  html.replace(/\sid="([^"]+)"/g, (_, id) => ids.add(id));
  if (!ids.size) return html;
  let out = html;
  ids.forEach((id) => {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out
      .replace(new RegExp(`id="${esc}"`, 'g'), `id="${id}-${suffix}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${id}-${suffix})`)
      .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${id}-${suffix}"`);
  });
  return out;
}

/** React useId vrací ":r1:" — dvojtečky se do SVG id nehodí. */
export function cleanId(id) {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}

/** Pozice ořezu: kterou část scény zachovat, když má kontejner jiný poměr stran. */
export const FOCUS = {
  center: 'xMidYMax slice',
  left: 'xMinYMax slice',
  right: 'xMaxYMax slice',
};

export function withFocus(html, focus) {
  const value = FOCUS[focus] || FOCUS.center;
  return html.replace(/preserveAspectRatio="[^"]*slice"/g, `preserveAspectRatio="${value}"`);
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Pozastaví animace, když scéna není vidět (mimo obrazovku nebo skrytá záložka).
 * Animace pak nežerou výkon, i když máš na stránce víc scén najednou.
 */
export function useInView(ref) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/**
 * Jemná paralaxa: vrstvy s data-depth se posunou proti pohybu myši.
 * Hodnota „dobíhá“ s malým zpožděním (lerp), takže pohyb působí přirozeně.
 * Jen pro zařízení s myší a bez prefers-reduced-motion. Píše přímo do
 * style.transform (žádný React re-render na každý pohyb myši).
 */
export function useParallax(rootRef, { enabled = true, strength = 1 } = {}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || !window.matchMedia) return undefined;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return undefined;

    const layers = Array.from(root.querySelectorAll('[data-depth]')).map((el) => ({
      el,
      d: parseFloat(el.getAttribute('data-depth')) || 0,
    }));
    const s = { tx: 0, ty: 0, cx: 0, cy: 0, raf: 0 };
    // full-screen hero se hýbe víc, malá karta míň
    const amp = () => Math.min(18, Math.max(8, root.clientWidth / 80)) * strength;

    const tick = () => {
      s.raf = 0;
      s.cx += (s.tx - s.cx) * 0.07;
      s.cy += (s.ty - s.cy) * 0.07;
      const a = amp();
      for (const { el, d } of layers) {
        el.style.transform = `translate3d(${(-s.cx * d * a).toFixed(2)}px, ${(-s.cy * d * a * 0.45).toFixed(2)}px, 0)`;
      }
      if (Math.abs(s.tx - s.cx) > 0.001 || Math.abs(s.ty - s.cy) > 0.001) s.raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      s.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      s.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      kick();
    };
    const onLeave = () => { s.tx = 0; s.ty = 0; kick(); };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (s.raf) cancelAnimationFrame(s.raf);
      layers.forEach(({ el }) => { el.style.transform = ''; });
    };
  }, [rootRef, enabled, strength]);
}

/** Vrstvy jedné scény připravené pro konkrétní instanci (unikátní id + ořez). */
export function usePreparedLayers(layers, focus, uid) {
  return useMemo(
    () => layers.map((l) => ({ ...l, html: scopeIds(withFocus(l.html, focus), uid) })),
    [layers, focus, uid],
  );
}

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}
