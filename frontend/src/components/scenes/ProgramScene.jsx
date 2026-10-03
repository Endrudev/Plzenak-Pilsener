import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import program from './data/program.layers';
import { cleanId, cx, scopeIds, useInView, usePrefersReducedMotion } from './shared';

export const PROGRAM_SCENES = ['Na trhu', 'Posezení', 'V parku'];
// „Na trhu“ běží poloviční dobu. Konstanta mimo komponentu, aby se nový
// array nevytvářel při každém renderu (jinak by se časovač pořád resetoval).
const DEFAULT_INTERVALS = [4000, 8000, 8000];

/**
 * Tři papírové scény (trh, posezení, park), které se střídají s přechodem
 * „pop-up knihy“: kusy staré scény se sklopí, nová se postaví kus po kusu.
 * Zem zůstává, světýlka v parku vyjedou nahoru.
 *
 * Řízené i neřízené použití:
 *   <ProgramScene />                                  // střídá se samo
 *   <ProgramScene controls />                         // + tečky pro ruční přepnutí
 *   <ProgramScene scene={i} onSceneChange={setI} />   // řídíš zvenku (např. vlastní taby)
 *
 * @param {number}  [scene]            řízený index scény 0–2
 * @param {(i:number)=>void} [onSceneChange]
 * @param {boolean} [autoplay=true]    samo přepíná
 * @param {number|number[]} [interval=[4000, 8000, 8000]]  ms, jak dlouho která scéna běží (jedno číslo = všechny stejně)
 * @param {boolean} [pauseOnHover=true]
 * @param {boolean} [controls=false]   zobrazit tečky
 * @param {boolean} [animate=true]     false = statická první scéna
 * @param {string}  [label]
 */
export default function ProgramScene({
  scene: controlled,
  onSceneChange,
  autoplay = true,
  interval = DEFAULT_INTERVALS,
  pauseOnHover = true,
  controls = false,
  animate = true,
  className,
  style,
  label,
}) {
  const ref = useRef(null);
  const uid = cleanId(useId());
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  const [inner, setInner] = useState(-1); // -1 = nic, aby se první scéna při načtení „postavila“
  const [hover, setHover] = useState(false);
  const isControlled = typeof controlled === 'number';
  const scene = isControlled ? controlled : inner;

  const parts = useMemo(() => ({
    ground: scopeIds(program.ground, uid),
    lights: scopeIds(program.lights, uid),
    scenes: [program.scene0, program.scene1, program.scene2].map((s) => scopeIds(s, uid)),
  }), [uid]);

  const go = useCallback((i) => {
    if (!isControlled) setInner(i);
    if (onSceneChange) onSceneChange(i);
  }, [isControlled, onSceneChange]);

  // první scéna se objeví až po připojení, aby proběhl vstupní přechod
  useEffect(() => {
    if (isControlled) return undefined;
    const t = setTimeout(() => setInner((s) => (s < 0 ? 0 : s)), 80);
    return () => clearTimeout(t);
  }, [isControlled]);

  // automatické střídání — stojí, když je scéna mimo obrazovku, záložka skrytá,
  // uživatel na ni míří myší, nebo má zapnuté omezení pohybu
  const paused = !autoplay || !animate || reduced || !inView || (pauseOnHover && hover);
  useEffect(() => {
    if (paused || scene < 0) return undefined;
    let elapsed = 0;
    let last = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      if (!document.hidden) elapsed += now - last;
      last = now;
      const dur = Array.isArray(interval) ? interval[scene] ?? 8000 : interval;
      if (elapsed >= dur) go((scene + 1) % 3);
    }, 100);
    return () => clearInterval(iv);
  }, [paused, scene, interval, go]);

  return (
    <div
      ref={ref}
      className={cx('pz-scene', 'pz-program', `on-${scene}`, !animate && 'still', !inView && 'pz-paused', className)}
      style={style}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <div className="pz-art" aria-hidden="true">
        <div className="sc-slot" dangerouslySetInnerHTML={{ __html: parts.ground }} />
        <div className="sc-slot" dangerouslySetInnerHTML={{ __html: parts.lights }} />
        {parts.scenes.map((html, i) => (
          <div key={i} className={cx('sc-slot', scene === i || (!animate && i === 0) ? 'on' : 'off')} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </div>
      {controls && (
        <div className="pz-dots" role="group" aria-label="Ilustrace">
          {PROGRAM_SCENES.map((name, i) => (
            <button key={name} type="button" className="pz-dot" aria-label={name} aria-pressed={scene === i} onClick={() => go(i)}>
              <span />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
