import LayeredScene from './LayeredScene';
import layers from './data/city.layers';

/**
 * Noční Plzeň z papíru — katedrála, synagoga, radnice, vodárna, pivovar.
 * Okna se postupně rozsvěcují, padají hvězdy, mezi ulicemi projíždí světla,
 * jezdí tramvaj, kouří se z komínů, vlaje vlajka na radnici.
 *
 * Vyplní rodiče. Velikost a zaoblení řeší rodič:
 *   <div style={{ height: '100svh' }}><CityScene shade /></div>
 *   <div className="card"><CityScene intro={false} /></div>
 *
 * @param {'center'|'left'|'right'} [focus='center'] která část města zůstane vidět při ořezu
 * @param {boolean} [animate=true]   false = statický obrázek (všechna okna svítí)
 * @param {boolean} [intro=true]     vrstvy se při načtení „zvednou“ jako v pop-up knize
 * @param {boolean} [parallax=true]  vrstvy se jemně posouvají za myší
 * @param {boolean} [shade=false]    ztmavení vlevo nahoře, aby byl čitelný text přes scénu
 * @param {string}  [label]          popis pro čtečky; bez něj je scéna dekorativní (aria-hidden)
 */
export default function CityScene(props) {
  return <LayeredScene layers={layers} rootClass="pz-city" {...props} />;
}
