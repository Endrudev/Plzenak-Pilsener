import CategoryPage from '../../components/category/CategoryPage/CategoryPage.jsx'
import { LazyCityScene } from '../../components/scenes/LazyScenes.jsx'
import cityHeroPoster from '../../components/scenes/posters/city-hero.webp'
import cityHeroMp4 from '../../components/scenes/videos/city-hero.mp4'
import { CATEGORIES } from '../../lib/filters/categories.jsx'

// Pevný filtr: top=1. Uživatel ho nemůže vypnout, jen hledat, vybrat období,
// zúžit na kategorii a řadit. Vzhled a chování drží sdílená šablona.
const FIXED = { top: '1' }

// Čipy „Typ“: zavedených 6 kategorií (CATEGORIES je jediný zdroj pravdy).
const TYPE_OPTIONS = CATEGORIES.map(c => ({ value: c.name, label: c.name }))

export default function TopAkce() {
    return (
        <CategoryPage
            fixed={FIXED}
            hero={{
                background: '#401909',
                sceneShift: true,
                video: { mp4: cityHeroMp4, poster: cityHeroPoster, position: '50% 0%' },
                scene: <LazyCityScene shade label="Noční Plzeň z papíru" />,
                breadcrumbLabel: 'TOP akce',
                title: 'TOP akce',
                lead: 'To nejlepší, co se v Plzni chystá. Každý týden ručně vybíráme akce, které stojí za to.',
            }}
            typeOptions={TYPE_OPTIONS}
            searchPlaceholder="Hledat mezi TOP akcemi"
            searchLabel="Hledat mezi TOP akcemi"
            countNote="ve výběru"
            emptyTitle="Žádné TOP akce zatím nejsou vyhlášené."
            exclude="top"
            ranked
        />
    )
}
