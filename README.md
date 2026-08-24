# Plzeňák

**Agregátor městských akcí pro Plzeň.** Fullstack webová aplikace — React SPA nad vlastním Node.js/Express + PostgreSQL API, s uploadem obrázků do Cloudflare R2.

> Osobní studijní projekt. Píšu ho proto, abych se naučil fullstack vývoj do hloubky — od SQL migrací přes REST API a autentizaci až po nasazení. Detaily o tom, jak vznikal, jsou v sekci [Jak projekt vznikal](#jak-projekt-vznikal).

> [!NOTE]
> **Aktuální stav: rozpracováno, zatím bez nasazení.** Aplikace je funkční lokálně — backend, databáze, administrace i veřejná část běží. Právě stavím CI pipeline; po ní přijde end-to-end testování a teprve pak nasazení. Podrobněji v sekci [Stav a další kroky](#stav-a-další-kroky).

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
- **Server-side filtrování a hledání** — text, kategorie, lokace i rychlé filtry se skládají do jednoho parametrizovaného SQL dotazu; stav filtru žije v URL (`useSearchParams`), takže odkaz na výsledek hledání jde sdílet
- Detail akce s popisem, odkazem na akci a vloženou mapou
- Stránkování, prázdné stavy, globální 404
- **Souhlasová vrstva (GDPR)** — cookie lišta, modal s nastavením kategorií a mapa, která se bez souhlasu vůbec neinicializuje (do kliknutí neodejde na Google Maps žádný request)
- Stránky Zásady ochrany osobních údajů a Podmínky užití

**Administrace** (chráněná JWT)
- Přihlášení, tabulka akcí s hledáním a stránkováním
- Vytvoření a editace akce — vlastní kalendářový picker v českém formátu, našeptávač adres přes Nominatim omezený na Plzeňský kraj, z vybrané adresy se generuje URL vložené mapy
- Upload hlavního obrázku do Cloudflare R2; při smazání akce se objekt maže i z bucketu

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
| `GET` | `/events` | — | seznam akcí; filtry `q`, `kategorie`, `misto`, `filtr` |
| `GET` | `/events/locations` | — | seznam unikátních lokací pro filtr |
| `GET` | `/events/:id` | — | detail akce |
| `POST` | `/events` | ✓ | vytvoření akce |
| `PUT` | `/events/:id` | ✓ | úprava akce |
| `DELETE` | `/events/:id` | ✓ | smazání akce + úklid obrázku v R2 |
| `POST` | `/events/:id/image` | ✓ | upload hlavního obrázku (`multipart/form-data`) |

Hodnoty parametru `filtr`: `dnes`, `tento-tyden`, `top-akce`.

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
- **Tajemství** — `.env` je v `.gitignore` a nikdy nebyl commitnutý; v repozitáři je jen `.env.example` s placeholdery
- **Frontend** — `useAuthGuard()` kontroluje i expiraci JWT, ne pouze přítomnost tokenu; souhlasová vrstva blokuje načtení mapy třetí strany do udělení souhlasu

---

## Stav a další kroky

Aplikace běží lokálně a je funkční — psaní i čtení akcí, administrace, upload obrázků, souhlasová vrstva. **Nasazená zatím není** a k launchi vede tahle cesta, v tomhle pořadí:

| # | Krok | Stav |
|:--:|---|---|
| 1 | **CI pipeline** (GitHub Actions — build a kontrola) | 🔨 právě se na tom pracuje |
| 2 | **End-to-end testování** celého toku (login, CRUD, veřejné čtení) | ⏳ čeká na CI |
| 3 | **Nasazení** — Dockerfile pro backend, Nginx pro frontend, `docker-compose.yml` | ⏳ čeká na testy |

Unit testy (Vitest) zatím nejsou — vědomé rozhodnutí, prioritou bylo nejdřív pochopit celý stack.

### Známé mezery

Vedu si je otevřeně, jsou to rozhodnutí a dluhy, ne přehlédnutí:

- **Fonty se tahají z Google Fonts** — request s IP uživatele odchází bez souhlasu, stejný problém, jaký už je u mapy ošetřený. Před launchem je potřeba je hostovat lokálně.
- **Upload nemá validaci** — `multer` běží bez `limits`, MIME se nekontroluje a jméno souboru od uživatele jde přímo do R2 klíče. Ošetřit před nasazením.
- **`POST /events` a upload obrázku jsou dvě nezávislá volání** bez atomicity; při selhání druhého se akce uklidí v `catch`, ale správně to není.
- **Filtry na homepage jsou dekorativní** — funkční filtrování žije na `/events`. Tamtéž zatím nedělá nic select „Datum" a tlačítko „Vyhledat".
- **Kategorie Hudba / Památky / Pro děti** zatím nejdou vybrat ve formuláři administrace.
- **`events.date` je `text`, ne `date`** — viz poznámka u [schématu](#databáze).
- **Mapové zobrazení akcí** (`/mapa`) je navržené, ale neimplementované.

---

## Jak projekt vznikal

Projekt je můj **první fullstack** a vznikal jako studijní. Pracuji na něm s pravidlem, které mi přišlo důležité si stanovit hned na začátku:

> **Veškerý backend, databázovou logiku, infrastrukturu a aplikační/stavovou logiku frontendu píšu sám.** AI asistent (Claude Code) slouží jako konzultant — vysvětluje koncepty, dělá code review, navrhuje alternativy, pomáhá debugovat. Výjimkou je čistě vizuální frontend kód (CSS, JSX layout), kde už zkušenost mám a psaní by mě nic nového nenaučilo.

Pravidlo je zapsané v [`CLAUDE.md`](CLAUDE.md) v kořeni repozitáře a drží se ho i historie commitů. Souběžně vedu dokumentační vault s deníkem rozhodnutí — proč padla která volba, jaké chyby jsem cestou udělal a co mě naučily. Například přechod ze Supabase na vlastní Express + PostgreSQL stack proběhl právě proto, že mi hotové BaaS řešení schovávalo přesně ty věci, které jsem se chtěl naučit.

Historie commitů je psaná česky a inkrementálně — jde z ní přečíst postup práce, ne jen výsledek.

---

## Licence

[MIT](LICENSE)
