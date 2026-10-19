import { useMemo } from 'react'
import CategoryPage from '../../components/category/CategoryPage/CategoryPage.jsx'
import { LazyCityScene } from '../../components/scenes/LazyScenes.jsx'
import cityHeroPoster from '../../components/scenes/posters/city-hero.webp'
import cityHeroMp4 from '../../components/scenes/videos/city-hero.mp4'
import cityHeroMobileMp4 from '../../components/scenes/videos/city-hero-mobile.mp4'
import { CATEGORIES } from '../../lib/filters/categories.jsx'
import { weekendIntro } from '../../lib/events/dayLabels.js'
import { useDocumentTitle } from '../../lib/useDocumentTitle.js'
import { TITLES } from '../../lib/pageTitle.js'

// Stránka pro dotaz „co dělat v Plzni o víkendu“ (SEO fáze 5, 2026-10-19).
// Pevný filtr datum=vikend: nejbližší sobota a neděle, v neděli jen ta neděle
// (stejně jako SQL v backend/src/lib/eventsQuery.js i věta weekendIntro).
const FIXED = { datum: 'vikend' }

const TYPE_OPTIONS = CATEGORIES.map(c => ({ value: c.name, label: c.name }))

export default function TentoVikend() {
    useDocumentTitle(TITLES.weekend)
    const intro = useMemo(() => weekendIntro(), [])
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
                breadcrumbLabel: 'Tento víkend',
                title: 'Tento víkend v Plzni',
            }}
            typeOptions={TYPE_OPTIONS}
            searchPlaceholder="Hledat ve víkendových akcích"
            searchLabel="Hledat ve víkendových akcích"
            countNote="o víkendu"
            emptyTitle="Na tento víkend zatím nic nemáme."
        />
    )
}
