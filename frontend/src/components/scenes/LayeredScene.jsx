import { useId, useRef } from 'react';
import { cleanId, cx, useInView, useParallax, usePreparedLayers } from './shared';

/**
 * Společný základ pro CityScene a ConcertScene: poskládá vrstvy (každá je
 * statické SVG) nad sebe, přidá paralaxu a pauzu mimo obrazovku.
 *
 * Vrstvy se vkládají jako hotové SVG řetězce (dangerouslySetInnerHTML).
 * Jsou to statická data z našeho generátoru, ne vstup od uživatele, takže
 * je to bezpečné — a React díky tomu nemusí hlídat tisíce SVG elementů.
 */
export default function LayeredScene({
  layers,
  rootClass,
  focus = 'center',
  animate = true,
  intro = true,
  parallax = true,
  shade = false,
  className,
  style,
  extraClass,
  label,
}) {
  const ref = useRef(null);
  const uid = cleanId(useId());
  const prepared = usePreparedLayers(layers, focus, uid);
  const inView = useInView(ref);
  useParallax(ref, { enabled: animate && parallax });

  return (
    <div
      ref={ref}
      className={cx('pz-scene', rootClass, extraClass, !animate && 'still', !inView && 'pz-paused', !intro && 'pz-no-intro', className)}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="scene">
        {prepared.map((l) => (
          <div key={l.name} className={`layer layer-${l.name}`} data-depth={l.depth}>
            <div className="rise" style={{ animationDelay: `${l.delay}s` }} dangerouslySetInnerHTML={{ __html: l.html }} />
          </div>
        ))}
      </div>
      {shade && <div className="shade" />}
    </div>
  );
}
