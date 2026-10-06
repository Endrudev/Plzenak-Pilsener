import { LazyCityScene } from '../scenes/LazyScenes.jsx'
import HeroTile from './HeroTile.jsx'
import cityPoster from '../scenes/posters/city.webp'
import cityWebm from '../scenes/videos/city.webm'
import cityMp4 from '../scenes/videos/city.mp4'
import './HeroTileTop.css'

// Bento dlaždice TOP akce: celá dlaždice je odkaz (kurzor a klik platí na celou
// plochu, ne jen na šipku). Noční Plzeň je smyčkové video vyrenderované ze scény CityScene
// (scripts/render-hero-videos.mjs), které se přehrává jen pod myší nebo s fokusem z
// klávesnice, viz HeroVideo.jsx a useHoverActive. Kostra je v HeroTile.
export default function HeroTileTop() {
    return (
        <HeroTile
            to="/top-akce"
            mod="top"
            index={0}
            poster={cityPoster}
            position="50% 100%"
            bleed
            shade="city"
            Live={LazyCityScene}
            liveProps={{ shade: true }}
            video={{ webm: cityWebm, mp4: cityMp4 }}
            title="TOP akce"
        />
    )
}
