import { LazyConcertScene } from '../scenes/LazyScenes.jsx'
import HeroTile from './HeroTile.jsx'
import concertPoster from '../scenes/posters/concert.webp'
import concertWebm from '../scenes/videos/concert.webm'
import concertMp4 from '../scenes/videos/concert.mp4'
import './HeroTileMusic.css'

// Bento dlaždice Hudba: koncert je smyčkové video vyrenderované ze scény ConcertScene
// (scripts/render-hero-videos.mjs). Pódium je ve scéně vpravo, proto se video ukotvuje
// vpravo (object-position): v užší dlaždici se ořízne zleva a zpěvák zůstane vidět. Video se
// přehrává jen pod myší nebo s fokusem z klávesnice, viz HeroVideo.jsx a useHoverActive.
// Kostra je v HeroTile.
export default function HeroTileMusic() {
    return (
        <HeroTile
            to="/hudba"
            mod="music"
            index={1}
            poster={concertPoster}
            position="100% 100%"
            bleed
            shade="concert"
            Live={LazyConcertScene}
            liveProps={{ focus: 'right', shade: true }}
            video={{ webm: concertWebm, mp4: concertMp4 }}
            title="Hudba"
            titleMod="md"
        />
    )
}
