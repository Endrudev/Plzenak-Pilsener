import CategoryPage from '../../components/category/CategoryPage/CategoryPage.jsx'
import { LazyConcertScene } from '../../components/scenes/LazyScenes.jsx'
import concertHeroPoster from '../../components/scenes/posters/concert-hero.webp'
import concertHeroMp4 from '../../components/scenes/videos/concert-hero.mp4'
import { useMediaQuery } from '../../lib/useMediaQuery.js'

// Pevný filtr: kategorie Hudba. Vzhled a chování drží sdílená šablona.
//
// Bez čipů „Typ“: žánry (jazz, rock, klasika) nejsou v databázi žádná skutečná
// kategorie ani štítek, takže by výběr žánru nic nefiltroval. Raději chybí, než
// aby předstíral filtr.
const FIXED = { kategorie: 'Hudba' }

export default function Hudba() {
    // Pódium je ve scéně vpravo. V úzkém hero by ho výchozí ořez na střed odřízl,
    // zůstal by jen dav.
    const narrow = useMediaQuery('(max-width: 767px)')

    return (
        <CategoryPage
            fixed={FIXED}
            hero={{
                background: '#140602',
                video: { mp4: concertHeroMp4, poster: concertHeroPoster, position: narrow ? '85% 50%' : '50% 50%' },
                scene: <LazyConcertScene focus={narrow ? 'right' : 'center'} shade label="Koncert z papíru" />,
                breadcrumbLabel: 'Hudba',
                title: 'Hudba',
                lead: 'Koncerty, kluby a festivaly. Od komorního jazzu přes varhany v katedrále po noc s DJem.',
            }}
            searchPlaceholder="Interpret nebo koncert"
            searchLabel="Hledat interpreta nebo koncert"
            countNote="v kategorii Hudba"
            emptyTitle="Žádné hudební akce zatím nejsou vyhlášené."
            exclude="hudba"
        />
    )
}
