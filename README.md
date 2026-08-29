# Plzeňák

**Agregátor městských akcí pro Plzeň.** Fullstack webová aplikace — React SPA nad vlastním Node.js/Express + PostgreSQL API, s uploadem obrázků do Cloudflare R2.

> Osobní studijní projekt. Píšu ho proto, abych se naučil fullstack vývoj do hloubky — od SQL migrací přes REST API a autentizaci až po nasazení. Detaily o tom, jak vznikal, jsou v sekci [Jak projekt vznikal](#jak-projekt-vznikal).

> [!NOTE]
> **Aktuální stav: rozpracováno, zatím bez nasazení.** Aplikace je funkční lokálně — backend, databáze, administrace i veřejná část běží. CI pipeline hlídá každý pull request; teď dopisuji unit testy a pak přijde kontejnerizace a nasazení. Podrobněji v sekci [Stav a další kroky](#stav-a-další-kroky).

---

## Obsah

- [Co aplikace umí](#co-aplikace-umí)
- [Technologie](#technologie)
- [Architektura](#architektura)
- [Lokální spuštění](#lokální-spuštění)
- [API](#api)
- [Databáze](#databáze)
- [Bezpečnost](#bezpečnost)
- [Stav a další kroky](#stav-a-další-kroky)
- [Jak projekt vznikal](#jak-projekt-vznikal)

---

## Co aplikace umí

**Veřejná část**
- Přehled akcí s fotogalerií, kategoriemi a časovými štítky (Dnes / Tento týden / TOP akce)
- **Server-side filtrování, hledání a řazení** — text, kategorie, lokace, časový rozsah i značka se skládají do jednoho parametrizovaného SQL dotazu; hledá se na potvrzení (tlačítko nebo Enter), ne při psaní, a stav filtru žije v URL (`useSearchParams`), takže odkaz na výsledek jde sdílet
- Detail akce s popisem, odkazem na akci a vloženou mapou
- Stránkování, prázdné stavy, globální 404
- **Souhlasová vrstva (GDPR)** — cookie lišta, modal s nastavením kategorií a mapa, která se bez souhlasu vůbec neinicializuje (do kliknutí neodejde na OpenStreetMap žádný request)
- Stránky Zásady ochrany osobních údajů a Podmínky užití

**Administrace** (chráněná JWT)
- Přihlášení, tabulka akcí s hledáním a stránkováním
- Vytvoření a editace akce — vlastní kalendářový picker v českém formátu, našeptávač adres přes Nominatim omezený na Plzeňský kraj, z vybrané adresy se generuje URL vložené mapy
- Upload hlavního obrázku do Cloudflare R2 — limit 5 MB, kontrola typu podle obsahu souboru; při výměně i smazání akce se starý objekt maže i z bucketu

---

## Technologie

| Vrstva | Technologie |
|---|---|
| Frontend | React 18, Vite, react-router-dom v7, plain CSS (design tokeny, žádný framework) |
| Backend | Node.js, Express 4 |
| Databáze | PostgreSQL — raw parametrizované SQL přes `pg`, **bez ORM** (záměr: naučit se SQL, ne abstrakci nad ním) |
| Auth | JWT (`jsonwebtoken`) + `bcrypt`, bez session |
| Úložiště souborů | Cloudflare R2 přes `@aws-sdk/client-s3` |
| Ostatní | `multer` (upload), `express-rate-limit`, `dotenv`, `cors` |

---

## Architektura

```
┌─────────────────────┐        HTTP / JSON        ┌──────────────────────┐
│   frontend/         │ ────────────────────────▶ │   backend/           │
│   React 18 + Vite   │   Bearer JWT u zápisů     │   Express API        │
│   :5173             │ ◀──────────────────────── │   :3001              │
└─────────────────────┘                           └──────────┬───────────┘
                                                             │
                                          ┌──────────────────┼──────────────────┐
                                          ▼                                     ▼
                                 ┌─────────────────┐                ┌──────────────────┐
                                 │  PostgreSQL     │                │  Cloudflare R2   │
                                 │  (Docker)       │                │  obrázky akcí    │
                                 └─────────────────┘                └──────────────────┘
```

```
backend/
├── index.js                     # entrypoint, mountuje routery, CORS, /api/health
├── migrations/                  # číslované SQL migrace (001, 002, 003…)
└── src/
    ├── db/
    │   ├── pool.js              # sdílený connection pool, jediná query(text, params)
    │   ├── migrate.js           # aplikuje nové migrace, eviduje je v schema_migrations
    │   └── seed.js              # založí admin účet z .env
    ├── routes/
    │   ├── auth.js              # POST /api/auth/login
    │   └── events.js            # CRUD nad akcemi + upload obrázku
    ├── middleware/
    │   ├── authMiddleware.js    # ověření Bearer tokenu, per-route (ne globálně)
    │   └── rateLimiter.js       # 5 pokusů o login / 15 min
    └── lib/
        └── r2.js                # sendObject / deleteObject nad Cloudflare R2

frontend/src/
├── App.jsx                      # routing; <Layout> potlačuje Header/Footer na /admin*
├── components/                  # EventCard, Header, Footer, CookieBanner, CookieSettings…
├── pages/                       # Home, Events, EventDetail, Admin*, Privacy, Terms, NotFound
├── lib/
│   ├── eventsApi.js             # jediné místo, kde se volá API
│   ├── ConsentContext.jsx       # stav souhlasu s cookies
│   └── useAuthGuard.js          # ochrana admin routes, kontroluje i expiraci JWT
└── styles/                      # design tokeny (barvy kategorií, stíny, timing)
```

### Rozhodnutí, která stojí za zmínku

- **Mapování `snake_case` ↔ `camelCase` běží na backendu** (`mapEvent` / `mapEventReverse`). Frontend nikdy neuvidí sloupce databáze — když se schéma přejmenuje, mění se jeden soubor.
- **`authMiddleware` je připojený per-route, ne globálně.** Veřejné čtení tak zůstává bez autentizace a chráněné je jen to, co opravdu zapisuje.
- **Filtrování počítá databáze, ne prohlížeč.** `GET /api/events` skládá `WHERE` podmínky dynamicky z query parametrů do pole `values` — vždy parametrizovaně, nikdy konkatenací řetězců.
- **Migrace jsou verzované a evidované** v tabulce `schema_migrations`, takže `npm run migrate` je idempotentní.
- **`GET /api/events/locations` musí být deklarované před `GET /api/events/:id`** — jinak by Express vzal `"locations"` jako hodnotu `:id`. Drobnost, ale přesně ten druh věci, který člověka naučí, jak router doopravdy funguje.

---

## Lokální spuštění

**Předpoklady:** Node.js 24 nebo novější, běžící PostgreSQL, volitelně Cloudflare R2 bucket pro upload obrázků.

### 1. Databáze

```bash
docker run --name plzenak-db -e POSTGRES_PASSWORD=heslo -e POSTGRES_DB=eventhub -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # a vyplnit hodnoty (viz níže)
npm run migrate           # vytvoří tabulky
npm run seed              # založí admin účet z ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # http://localhost:3001
```

Proměnné v `backend/.env`:

| Proměnná | Popis |
|---|---|
| `PORT` | port API (výchozí 3001) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | připojení k PostgreSQL |
| `JWT_SECRET` | tajný klíč pro podpis tokenů — **min. 32 náhodných znaků** |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | účet, který založí `npm run seed` |
| `FRONTEND_URL` | origin povolený v CORS (`http://localhost:5173`) |
| `R2_*` | Cloudflare R2 — bez nich funguje vše kromě uploadu obrázků |

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3001
npm run dev               # http://localhost:5173
```

Administrace je na `/admin`, přihlašuje se údaji ze `seed`.

---

## API

Základ: `/api`. Zápisové operace vyžadují hlavičku `Authorization: Bearer <token>`.

| Metoda | Cesta | Auth | Popis |
|---|:---:|:---:|---|
| `GET` | `/health` | — | health check |
| `POST` | `/auth/login` | — | přihlášení, vrací JWT (platnost 8 h); rate limit 5 / 15 min |
| `GET` | `/events` | — | seznam budoucích akcí; filtry `q`, `kategorie`, `misto`, `datum`, `top` a řazení `razeni` |
| `GET` | `/events/locations` | — | seznam unikátních lokací pro filtr |
| `GET` | `/events/:id` | — | detail akce |
| `POST` | `/events` | ✓ | vytvoření akce |
| `PUT` | `/events/:id` | ✓ | úprava akce |
| `DELETE` | `/events/:id` | ✓ | smazání akce + úklid obrázku v R2 |
| `POST` | `/events/:id/image` | ✓ | upload hlavního obrázku (`multipart/form-data`) |

Hodnoty `datum`: `dnes`, `vikend`, `7dni`, `30dni`. Hodnoty `razeni`: `konani` (výchozí), `pridano`. Neznámá hodnota se ignoruje, resp. spadne na výchozí řazení.

---

## Databáze

```sql
events
  id           serial PRIMARY KEY
  name         text NOT NULL
  date         text NOT NULL          -- formát DD.MM.YYYY
  date_short   text NOT NULL
  location     text NOT NULL
  tags         text[]                 -- kategorie akce
  badge        text
  badge_type   text
  img_class    text
  url          text
  description  text[] NOT NULL        -- odstavce popisu
  map_src      text
  image_url    text                   -- migrace 002
  image_key    text                   -- migrace 003, klíč objektu v R2
  created_at   timestamptz DEFAULT now()

admins
  id             serial PRIMARY KEY
  email          text UNIQUE NOT NULL
  password_hash  text NOT NULL        -- bcrypt, 12 rounds
  created_at     timestamptz DEFAULT now()
```

> **Známý dluh:** `date` je `text`, ne `date`. Filtry proto musí datum parsovat za běhu (`TO_DATE(date, 'DD.MM.YYYY')`), což znemožňuje index. Je to pozůstatek z první verze aplikace a stojí na seznamu k opravě — vědomě, ne omylem.

---

## Bezpečnost

Co je v aplikaci ošetřené:

- **Hesla** — `bcrypt`, 12 rounds; hash se nikdy nevrací z API (`const {password_hash, ...safeAdmin} = ...`)
- **SQL injection** — výhradně parametrizované dotazy (`$1`, `$2`…), i u dynamicky skládaných filtrů
- **Autorizace** — `authMiddleware` ověřuje podpis i expiraci tokenu a rozlišuje `TokenExpiredError` od neplatného tokenu
- **Brute force** — rate limit na `/api/auth/login` (5 pokusů / 15 min)
- **CORS** — povolený jen origin z `FRONTEND_URL`, ne wildcard
- **Validace vstupů** — ruční kontrola povinných polí na všech zápisových endpointech
- **Upload souborů** — limit 5 MB, whitelist MIME, ověření skutečného typu podle magických bajtů obsahu; klíč v bucketu generuje server, jméno souboru od uživatele se nepoužije
- **Tajemství** — `.env` je v `.gitignore` a nikdy nebyl commitnutý; v repozitáři je jen `.env.example` s placeholdery
- **Frontend** — `useAuthGuard()` kontroluje i expiraci JWT, ne pouze přítomnost tokenu; souhlasová vrstva blokuje načtení mapy třetí strany do udělení souhlasu

---

## Stav a další kroky

Aplikace běží lokálně a je funkční — psaní i čtení akcí, administrace, upload obrázků, souhlasová vrstva. **Nasazená zatím není** a k launchi vede tahle cesta, v tomhle pořadí:

| # | Krok | Stav |
|:--:|---|---|
| 1 | **CI pipeline** (GitHub Actions — dva joby, běží na každém PR i po merge) | ✅ hotovo |
| 2 | **Unit testy** (Vitest) — pokrytá souhlasová vrstva, zbytek se dopisuje | 🔨 rozpracováno |
| 3 | **Nasazení** — Dockerfile pro backend, Nginx pro frontend, `docker-compose.yml` | ⏳ další na řadě |
| 4 | **End-to-end ověření** celého toku (login, CRUD, veřejné čtení) v Compose prostředí | ⏳ čeká na nasazení |

Pipeline hlídá u frontendu instalaci z lockfilu, testy a produkční build (včetně typové kontroly), u backendu instalaci a syntaktickou kontrolu všech souborů. Až budou testy i na backendu, syntaktickou kontrolu nahradí.

### Známé mezery

Vedu si je otevřeně, jsou to rozhodnutí a dluhy, ne přehlédnutí:

- **Fonty se tahají z Google Fonts** — request s IP uživatele odchází bez souhlasu, stejný problém, jaký už je u mapy ošetřený. Před launchem je potřeba je hostovat lokálně.
- **`POST /events` a upload obrázku jsou dvě nezávislá volání** bez atomicity; při selhání druhého se akce uklidí v `catch`, ale správně to není.
- **Kategorie Hudba / Památky / Pro děti** zatím nejdou vybrat ve formuláři administrace.
- **`events.date` je `text`, ne `date`** — viz poznámka u [schématu](#databáze).
- **Mapové zobrazení akcí** (`/mapa`) je navržené, ale neimplementované.

---

## Jak projekt vznikal

Projekt je můj **první fullstack** a od začátku je hlavně studijní. Nejde v něm o to mít appku co nejrychleji — jde o to rozumět každé její vrstvě. Podle toho se v čase mění i to, co na projektu dělám sám a co si nechám udělat.

### Fáze 1 — všechno vlastníma rukama

Začal jsem s pravidlem, které jsem si stanovil hned na první den:

> **Veškerý backend, databázovou logiku, infrastrukturu a aplikační/stavovou logiku frontendu píšu sám.** AI asistent (Claude Code) je konzultant — vysvětluje koncepty, dělá code review, navrhuje alternativy, pomáhá debugovat. Nikdy nedodává hotové řešení ke zkopírování.

Bylo to nepohodlné a pomalé, a přesně o to šlo. Tahle fáze mě naučila věci, které bych přečtením hotového kódu nezískal:

- **Proč jsem odešel od Supabase.** Hotové BaaS řešení mi schovávalo přesně ty věci, které jsem se chtěl naučit — vlastní auth, migrace, návrh schématu. Přepsání na vlastní Express + PostgreSQL bylo dobrovolné zdržení, které dávalo smysl.
- **Proč tenhle projekt nemá ORM.** Parametrizované SQL přes `pg` píšu ručně, protože chci umět SQL, ne abstrakci nad ním. `$1` se váže podle **pozice** v poli — na to jsem přišel tím, že jsem si prohozením parametrů tiše zapsal hodnoty do špatných sloupců.
- **Chyby, ze kterých si člověk odnese víc než z tutoriálu.** Funkce, co vždycky vracela `undefined` kvůli `return` na samostatném řádku. Smazání akce, které nechalo obrázek navždy v R2. Souhlasová vrstva, kde `typeof null === 'object'` propustilo neplatný zápis.

Jednu výjimku jsem si povolil brzy (srpen 2026): **čistě vizuální frontend kód** — CSS a JSX layout. V designu už zkušenost mám, takže by mě jeho ruční psaní nenaučilo nic nového.

### Fáze 2 — architektuře rozumím, těžiště se posouvá

Ve chvíli, kdy stála celá architektura — vlastní API, JWT autentizace, migrace, upload do R2, server-side filtrování, souhlasová vrstva — se situace obrátila. **Vím, co a jak; ruční psaní mravenčí práce už mě nic nového neučí, jen zdržuje.**

Od 27. 8. 2026 proto platí posunutá hranice:

| Oblast | Kdo píše |
|---|---|
| Frontend vizuál, backendová i frontendová aplikační logika | AI asistent — s vysvětlením a po konzultaci se mnou |
| **CI/CD, DevOps, nasazení** | **já sám** |
| Architektonická a produktová rozhodnutí | já sám |

**Co se ale nezměnilo ani o kus:** každou napsanou věc si nechám vysvětlit — co dělá, jak funguje a jaká rozhodnutí v ní jsou — a všechna rozhodnutí padají v diskuzi předtím, než se sáhne na kód. Nejde o rychlost za cenu neporozumění. Jde o to nedělat ručně to, čemu už rozumím.

A hlavně: **DevOps je teď to, čemu nerozumím**, takže si ho beru na sebe a AI u něj hraje přesně tu roli, kterou dřív hrála u backendu — vysvětluje princip, ukáže malý izolovaný příklad a nechá mě to napsat. Tak vznikla CI pipeline v [`.github/workflows/ci.yml`](.github/workflows/ci.yml) a stejně vznikne i Docker a nasazení.

Hranice se tedy neposouvá pohodlím, ale tím, **co už umím** — a další na řadě je infrastruktura.

### Kde je vidět postup

Pravidlo v aktuálním znění je v [`CLAUDE.md`](CLAUDE.md). Souběžně vedu **dokumentační vault** (samostatný repozitář `Plzenak-Pilsener-docs`), který je zdrojem pravdy o projektu — architektura, API kontrakt, rejstřík rozhodnutí a deník — proč padla která volba, jaké chyby jsem udělal a co mě naučily. Historie commitů je psaná česky a inkrementálně, takže z ní jde přečíst postup práce, ne jen výsledek.

---

## Licence

[MIT](LICENSE)
