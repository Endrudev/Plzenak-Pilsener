const dotenv = require('dotenv')
const path = require('path')

dotenv.config({path: path.join(__dirname, '../../.env')})

const {query} = require('./pool')

// Gradientové třídy, co dnes v EventCard.css reálně existují — cyklí se mezi
// nimi u akcí bez nahraného obrázku (viz frontend/src/components/EventCard/EventCard.css).
const IMG_CLASSES = ['event-image--majales', 'event-image--sklo', 'event-image--prazdroj']

// Stejný způsob sestavení OSM embed URL jako v AdminCreate.jsx/AdminEdit.jsx
// (bbox = W,S,E,N kolem bodu, marker = lat,lon) — souřadnice jsou přibližné
// polohy skutečných plzeňských míst, jen pro vizuální testování mapy na detailu.
function mapSrc(lat, lon) {
    const bbox = `${lon - 0.008},${lat - 0.005},${lon + 0.008},${lat + 0.005}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
}

const events = [
    {
        name: 'Jazz na Papírně',
        date: '21.09.2026',
        location: 'Papírna, Plzeň',
        tags: ['Hudba'],
        url: 'https://vstupenky.cz/jazz-na-papirne',
        description: [
            'Komorní jazzový večer v industriálním prostoru bývalé papírny na břehu Radbuzy. Na pódiu se vystřídá plzeňské klavírní trio a hostující saxofonista.',
            'Vstup od 18:00, hrát se začíná v 19:00. Bar je otevřený celý večer.',
        ],
        mapSrc: mapSrc(49.744, 13.369),
    },
    {
        name: 'Rodinný den v ZOO Plzeň',
        date: '22.09.2026',
        location: 'Zoo Plzeň',
        tags: ['Děti'],
        url: null,
        description: [
            'Celodenní program pro rodiny s dětmi — komentovaná krmení, dílny pro nejmenší a hledačka po výběhu s odměnou v cíli.',
            'Akce je součástí běžného vstupného do zoo, žádný speciální lístek netřeba.',
        ],
        mapSrc: mapSrc(49.758, 13.366),
    },
    {
        name: 'FC Viktoria Plzeň – AC Sparta Praha',
        date: '26.09.2026',
        location: 'Doosan Aréna',
        tags: ['Sport'],
        url: 'https://vstupenky.cz/viktoria-sparta-2609',
        description: [
            'Ligové derby na Doosan Aréně. Výkop v 15:00, brány se otevírají dvě hodiny předem.',
        ],
        mapSrc: mapSrc(49.735, 13.363),
    },
    {
        name: 'Podzimní farmářské trhy',
        date: '27.09.2026',
        location: 'náměstí Republiky',
        tags: ['Gastro'],
        url: null,
        description: [
            'Pravidelné nedělní trhy — sezónní zelenina, pečivo od místních pekáren, sýry a řemeslné pivo ze západočeských minipivovarů.',
        ],
        mapSrc: mapSrc(49.7473, 13.3775),
    },
    {
        name: 'Loutkové divadlo Alfa – Pohádka o Smolíčkovi',
        date: '28.09.2026',
        location: 'Divadlo Alfa',
        tags: ['Děti', 'Kultura'],
        url: null,
        description: [
            'Klasická česká pohádka v podání loutkoherců Divadla Alfa. Vhodné pro děti od 3 let, délka představení cca 50 minut.',
        ],
        mapSrc: null,
    },
    {
        name: 'Pilsner Fest',
        date: '03.10.2026',
        location: 'Papírenská ulice',
        tags: ['Gastro', 'TOP akce'],
        url: null,
        description: [
            'Street food festival v centru města — dvě desítky stánků, živá hudba na dvou pódiích a ochutnávka piv z regionálních pivovarů.',
            'Vstup volný, otevřeno od 10:00 do 22:00 po oba dny.',
        ],
        mapSrc: mapSrc(49.744, 13.372),
    },
    {
        name: 'DEPO2015 – Deskohraní',
        date: '04.10.2026',
        location: 'DEPO2015',
        tags: ['Kultura', 'Děti'],
        url: null,
        description: [
            'Celoodpolední herní maraton v bývalé tramvajové vozovně — stovky deskových her k vyzkoušení, půjčovna zdarma s vratnou zálohou.',
        ],
        mapSrc: null,
    },
    {
        name: 'Sklo a plamen',
        date: '10.10.2026',
        location: 'Techmania',
        tags: ['Kultura'],
        url: null,
        description: [
            'Řemeslný festival sklářů a foukačů skla s ukázkami přímo u pece. Doprovodný program pro školy dopoledne, pro veřejnost od 13:00.',
        ],
        mapSrc: mapSrc(49.7245, 13.3527),
    },
    {
        name: 'Noc kostelů',
        date: '09.10.2026',
        location: 'Katedrála sv. Bartoloměje',
        tags: ['Památky'],
        url: null,
        description: [
            'Večerní prohlídky katedrály včetně věže, komentované varhanní vystoupení a možnost vystoupat na ochoz s výhledem na město.',
        ],
        mapSrc: mapSrc(49.7472, 13.3776),
    },
    {
        name: 'Plzeňský půlmaraton',
        date: '18.10.2026',
        location: 'Start: náměstí Republiky',
        tags: ['Sport'],
        url: 'https://vstupenky.cz/plzensky-pulmaraton',
        description: [
            'Trasa vede historickým centrem a podél Radbuzy zpět na náměstí. K půlmaratonu je i doprovodný běh na 5 km pro rodiny.',
            'Registrace na místě je možná do vyčerpání kapacity startovních čísel.',
        ],
        mapSrc: mapSrc(49.7473, 13.3775),
    },
    {
        name: 'Vánoční trhy na náměstí Republiky',
        date: '01.12.2026',
        location: 'náměstí Republiky',
        tags: ['Kultura'],
        url: null,
        description: [
            'Tradiční adventní trhy s dřevěnými stánky, kluzištěm a denním programem na hlavním pódiu — od dětských sborů po předvánoční koncerty.',
            'Otevřeno denně od 10:00 do 20:00 až do Štědrého dne.',
        ],
        mapSrc: mapSrc(49.7473, 13.3775),
    },
    {
        name: 'Plzeňské Majáles',
        date: '24.04.2027',
        location: 'Sady Pětatřicátníků',
        tags: ['Kultura', 'Hudba', 'TOP akce'],
        url: 'https://www.plzenskymajales.cz/',
        description: [
            'Největší západočeská studentská slavnost — průvod městem, dvě pódia s českými a slovenskými kapelami a tradiční volba krále a královny Majálesu.',
            'Vstup na hlavní program je volný, k areálu jezdí speciální festivalová tramvaj.',
        ],
        mapSrc: mapSrc(49.7455, 13.3805),
    },
]

async function seedEvents() {
    let inserted = 0
    for (const [i, e] of events.entries()) {
        const dateShort = e.date.slice(0, e.date.lastIndexOf('.'))
        const imgClass = IMG_CLASSES[i % IMG_CLASSES.length]
        await query(`
            INSERT INTO events (name, date, date_short, location, tags, img_class, url, description, map_src)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
            `, [e.name, e.date, dateShort, e.location, e.tags, imgClass, e.url, e.description, e.mapSrc]
        )
        inserted++
    }
    console.log(`Seed dokončen: vloženo ${inserted} testovacích akcí.`)
    process.exit(0)
}

seedEvents().catch(err => {
    console.error('Chyba seedu akcí:', err.message)
    process.exit(1)
})
