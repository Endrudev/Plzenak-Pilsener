import LayeredScene from './LayeredScene';
import layers from './data/concert.layers';

const TEMPO = { slow: 'tempo-slow', normal: '', fast: 'tempo-fast' };

/**
 * Koncert z papíru — zpěvák zpívá a podupává, z mikrofonu letí noty,
 * dav poskakuje a mává, bubeník a kytarista hrají, reflektory kmitají,
 * padají konfety. Všechno běží v jednom rytmu (výchozí 120 BPM).
 *
 * Pódium je vpravo. V úzké kartě dej focus="right", ať zpěvák nezmizí.
 *
 * @param {'center'|'left'|'right'} [focus='center']
 * @param {'slow'|'normal'|'fast'} [tempo='normal']  rytmus celé scény (≈ 88 / 120 / 150 BPM)
 * @param {boolean} [animate=true]
 * @param {boolean} [intro=true]
 * @param {boolean} [parallax=true]
 * @param {boolean} [shade=false]
 * @param {string}  [label]
 */
export default function ConcertScene({ tempo = 'normal', ...props }) {
  return <LayeredScene layers={layers} rootClass="pz-concert" extraClass={TEMPO[tempo]} {...props} />;
}
