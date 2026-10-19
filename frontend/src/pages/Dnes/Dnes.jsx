import { useMemo } from 'react'
import CategoryPage from '../../components/category/CategoryPage/CategoryPage.jsx'
import { LazyCityScene } from '../../components/scenes/LazyScenes.jsx'
import cityHeroPoster from '../../components/scenes/posters/city-hero.webp'
import cityHeroMp4 from '../../components/scenes/videos/city-hero.mp4'
import cityHeroMobileMp4 from '../../components/scenes/videos/city-hero-mobile.mp4'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { todayIntro } from '../../lib/events/dayLabels.js'
import { useDocumentTitle } from '../../lib/useDocumentTitle.js'
import { TITLES } from '../../lib/pageTitle.js'

// Stránka pro nejčastější dotaz „co dělat v Plzni dnes“ (SEO fáze 5, 2026-10-19).
// Pevný filtr datum=dnes, uživatel jen hledá, zužuje typem a řadí. Přepínač
// „Kdy“ tu není, období je téma stránky. Úvodní věta nese dnešní datum.
const FIXED = { datum: 'dnes' }

const TYPE_OPTIONS = CATEGORIES.map(c => ({ value: c.name, label: c.name }))

export default function Dnes() {
    useDocumentTitle(TITLES.today)
    const intro = useMemo(() => todayIntro(), [])
    return (
        <CategoryPage
            fixed={FIXED}
            showKdy={false}
            intro={intro}
            hero={{
                background: '#401909',
                sceneShift: true,
                video: { mp4: cityHeroMp4, mobileMp4: cityHeroMobileMp4, poster: cityHeroPoster, position: '50% 100%' },
                scene: <LazyCityScene shade label="Noční Plzeň z papíru" />,
                breadcrumbLabel: 'Dnes',
                title: 'Dnes v Plzni',
            }}
            typeOptions={TYPE_OPTIONS}
            searchPlaceholder="Hledat v dnešních akcích"
            searchLabel="Hledat v dnešních akcích"
            countNote="dnes"
            emptyTitle="Dnes se v Plzni nic nekoná. Zkus tento víkend."
        />
    )
}
