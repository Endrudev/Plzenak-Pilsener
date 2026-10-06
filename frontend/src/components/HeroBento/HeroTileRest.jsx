import { LazyProgramScene } from '../scenes/LazyScenes.jsx'
import HeroTile from './HeroTile.jsx'
import programPoster from '../scenes/posters/program.webp'
import './HeroTileRest.css'

// Bento dlaždice Zbytek programu: scéna ProgramScene z components/scenes/ sama střídá
// trh, posezení a park. Z textu zůstal jen nadpis, šipka je jako u ostatních dvou
// (zelená). Dlaždice je odkaz, takže bez ovládacích teček: tlačítko uvnitř odkazu by
// byla neplatná struktura. Scéna se animuje jen pod myší nebo s fokusem z klávesnice
// (viz useHoverActive), a protože je pak dlaždice pod myší pořád, střídání scén se
// nesmí pozastavovat najetím (pauseOnHover). Kostra je v HeroTile.
export default function HeroTileRest() {
    return (
        <HeroTile
            to="/zbytek-programu"
            mod="rest"
            index={2}
            poster={programPoster}
            position="50% 100%"
            Live={LazyProgramScene}
            liveProps={{ pauseOnHover: false }}
            title="Zbytek programu"
            titleMod="sm"
        />
    )
}
