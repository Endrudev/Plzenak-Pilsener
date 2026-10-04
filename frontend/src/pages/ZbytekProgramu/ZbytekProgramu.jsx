import CategoryPage from '../../components/category/CategoryPage/CategoryPage.jsx'
import { LazyProgramScene } from '../../components/scenes/LazyScenes.jsx'
import { CATEGORIES } from '../../lib/filters/categories.jsx'

// „Zbytek programu“ je všechno kromě TOP akcí a Hudby (ty mají vlastní stránky).
// Filtruje vyloučením přes parametr `vyjma` na backendu, ne kladným výběrem.
const FIXED = { vyjma: 'TOP akce,Hudba' }

// Čipy „Typ“: zbylých 5 kategorií, Hudbu tahle stránka sama vylučuje.
const TYPE_OPTIONS = CATEGORIES.filter(c => c.name !== 'Hudba').map(c => ({ value: c.name, label: c.name }))

export default function ZbytekProgramu() {
    return (
        <CategoryPage
            fixed={FIXED}
            hero={{
                background: '#e2e8d7',
                theme: 'light',
                scene: <LazyProgramScene label="Trh, posezení a park z papíru" />,
                breadcrumbLabel: 'Zbytek programu',
                title: 'Zbytek programu',
                lead: 'Trhy, kino, divadlo, prohlídky i akce pro děti. Nic tě nehoní, projdi si to v klidu.',
            }}
            typeOptions={TYPE_OPTIONS}
            searchPlaceholder="Hledat v programu"
            searchLabel="Hledat v programu"
            countNote="v programu"
            emptyTitle="Žádné další akce zatím nejsou vyhlášené."
            exclude="zbytek"
        />
    )
}
