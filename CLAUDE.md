# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How we work on this project — READ FIRST

There is a companion Obsidian vault, `Plzenak-Pilsener-docs`, sitting next to this repo (sibling folder). Its `README.md` states the hard rule for this project, and it overrides default Claude Code behavior:

This project exists purely for the author's (ondra.stindl@gmail.com) own learning. **The boundary of what Claude may write has moved twice as the author's understanding grew — do not assume an older version of the rule.** Current split, effective 2026-08-27:

| Area | Who writes it |
|---|---|
| Frontend visual/design (CSS, JSX layout/markup) | **Claude** (since 2026-08-08) |
| Backend application logic (routes, SQL, data handling, validation) | **Claude** (since 2026-08-27) |
| Frontend application/state logic (`useState`, `useEffect`, `fetch`) | **Claude** — same regime as backend |
| **CI/CD, DevOps, infrastructure** (Docker, Compose, pipeline, deployment) | **the author** — Claude explains, shows small isolated examples, reviews. Do not write these files unless asked. |
| Architectural and product decisions | **the author** — Claude proposes options with a recommendation |

**What never changes, regardless of who types the code:**

- **Explain everything you write.** Not "done" — what changed, how it works, which decisions are baked into it. The author wants to understand the codebase in detail; speed is not worth losing that.
- **Consult decisions before implementing**, don't decide unilaterally. Design discussions before code are explicitly welcome and have repeatedly caught problems.
- When the author is unsure how something works, **teach it** — principle, small isolated example, then the code.
- **DevOps is now the advisory-only area**, playing the role backend used to: the author is learning it hands-on, so guide rather than implement.
- The **docs vault** is Claude's to maintain (decisions, plan changes, journal entries) — that's documentation, not production code.

## Where the truth lives

**The vault is the source of truth, this file is orientation.** Vault structure (reorganized 2026-08-20):

| Question | Vault page |
|---|---|
| What is this project, what's the status | `01 Projekt/Přehled.md` |
| What blocks public launch | `01 Projekt/Launch checklist.md` |
| **Anything planned/deferred/an idea** | `01 Projekt/Po launchi.md` — single list, don't scatter plans elsewhere |
| Why is something the way it is | `05 Poznámky/Deník.md` (chronological, newest on top) |
| Design system, visual rules, screens | `02 Frontend/Styling a komponenty.md` |
| Cookie/consent layer | `02 Frontend/Souhlas a cookies.md` |
| Backend routes, DB schema, R2, security | `03 Backend/*.md` |
| Docker/CI plans | `04 DevOps/Nasazení a CI.md` |

Rule of thumb used in the vault: **topic pages describe the present, the journal the past, `Po launchi` the future.**

## Commands

Frontend and backend are separate npm projects in `frontend/` and `backend/` — run commands from inside each directory.

```bash
# frontend/
npm run dev       # Start dev server at http://localhost:5173
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally

# backend/
npm run dev       # nodemon index.js — Express API at http://localhost:3001
npm run migrate   # apply pending SQL migrations (schema_migrations tracking)
npm run seed      # create admin account from ADMIN_EMAIL/ADMIN_PASSWORD in .env
```

No linting or test tooling is configured on either side. PostgreSQL runs as a standalone Docker container (no `docker-compose.yml` yet — that's the main launch blocker).

## Purpose

Event Hub is a city event aggregator for Plzeň (brand: **Plzeňák** CS / **Pilsener** EN). It is a CRUD application — admins add, edit, and delete events; visitors browse and view them.

**User flow (public):** Home → browse/filter events → event detail
**Admin flow:** Footer "Admin log in" → `/admin` → `/admin/dashboard` → `/admin/create` or `/admin/edit/:id`

## Architecture

React 18 SPA (`frontend/`) built with Vite, talking to a Node.js/Express + PostgreSQL API (`backend/`), with event images in Cloudflare R2. Supabase is fully removed. Routing via react-router-dom v7.

### Routing (`frontend/src/App.jsx`)

`<Layout>` (inside `<BrowserRouter>`) uses `useLocation` to suppress `Header`, `Footer` **and the cookie banner/modal** on all `/admin*` routes.

| Route | Component | Header/Footer |
|---|---|---|
| `/` | `Home` | ✓ |
| `/events` | `Events` | ✓ |
| `/events/:id` | `EventDetail` | ✓ |
| `/zasady-ochrany-osobnich-udaju` | `Privacy` | ✓ |
| `/podminky-uziti` | `Terms` | ✓ |
| `*` | `NotFound` | ✓ |
| `/admin` | `Admin` (login) | ✗ |
| `/admin/dashboard` | `AdminDashboard` | ✗ |
| `/admin/create` | `AdminCreate` | ✗ |
| `/admin/edit/:id` | `AdminEdit` | ✗ |

`<Route path="*">` must stay last. **Known bug:** `Header` has a "Mapa" button linking to `/mapa`, which is not a route — it lands on the 404 page.

Since the 2026-08-13 redesign the header is a **single** variant (`#site-header`: brand lockup via `PlzenakLogo`, nav with a category dropdown, "Mapa" button). The old `header--hero`/`--dark`/`--plain` variants no longer exist.

### Consent layer (`frontend/src/lib/consent.js`, `ConsentContext.jsx`)

Consent lives in `localStorage` under `plzenak-consent` (`{v, ts, maps}`), versioned via `CONSENT_VERSION`; missing/invalid/outdated = undecided → banner shows and nothing optional loads. Nothing is sent to the backend. `ConsentProvider` wraps `Layout`; `useConsent()` exposes `{consent, acceptAll, rejectAll, save, openSettings, closeSettings, isSettingsOpen}`. The OpenStreetMap iframe on `EventDetail` renders only when `consent.maps === true`, otherwise `ConsentGate/MapConsent`. There is deliberately **no analytics category** (no analytics exists). Fonts are still loaded from Google Fonts before any consent — an open launch blocker.

### Backend (`backend/`)

Express + PostgreSQL via `pg`, no ORM (raw parametrized SQL by design).

- `index.js` — entrypoint; `dotenv.config()` must run before anything that reads `process.env`
- `src/db/pool.js` — shared pool, single `query(text, params)`
- `src/db/migrate.js` — applies pending migrations, tracked in `schema_migrations` (001 tables, 002 `image_url`, 003 `image_key`)
- `src/db/seed.js` — creates the admin account from `.env`
- `src/lib/r2.js` — thin AWS SDK v3 wrapper for Cloudflare R2: `sendObject`, `deleteObject`
- `src/routes/auth.js` — `POST /api/auth/login` (bcrypt + JWT, behind `loginLimiter`)
- `src/routes/events.js` — `GET /`, `GET /locations`, `GET /:id` public; `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/image` protected
- `src/middleware/authMiddleware.js` — verifies `Authorization: Bearer <token>`, attached per-route
- `src/middleware/rateLimiter.js` — `loginLimiter` (5 attempts / 15 min)

`GET /locations` must stay above `GET /:id` in the file. Filtering is server-side: `GET /` builds a dynamic parametrized `WHERE` from `q`, `kategorie`, `misto`, `filtr`.

**Auth:** JWT, no sessions. Token in `localStorage`, sent as `Authorization: Bearer`. `useAuthGuard()` checks presence **and expiry** client-side (UX only — real verification is `jwt.verify` on the backend).

**Data mapping:** DB columns are `snake_case`, API/frontend `camelCase`. Mapping happens on the backend (`mapEvent`/`mapEventReverse`).

**Images:** uploaded to the backend (`multer` memory) → pushed to R2 → public URL in `image_url`, object key in `image_key`. Deleting an event best-effort deletes the R2 object too. Known gaps: replacing an image orphans the old object, upload has no size/MIME validation, and the second image slot in the admin forms saves nowhere (decided 2026-08-20: remove it from the UI before launch, build `event_images` after).

### Data

Every public page fetches through `frontend/src/lib/eventsApi.js` (`getEvents`, `getEventLocations`, `getEventById`, `createEvent`, `updateEvent`, `deleteEvent`, `uploadEventImage`). Event shape:

- `id`, `name`, `date`, `dateShort`, `location`, `tags[]`, `badge`, `badgeType`, `imgClass`, `imageUrl`
- `url`, `description[]`, `mapSrc` — detail page only

`imageUrl` (R2) takes precedence over `imgClass` (CSS gradient) everywhere an event image is drawn. `frontend/src/data/events.js` is orphaned pre-API mock data, imported nowhere.

### Admin pages (`frontend/src/pages/Admin*`)

- **Admin** — login form; `POST /api/auth/login`, token to `localStorage`.
- **AdminDashboard** — `useAuthGuard()`. Paginated table (10/page), client-side name filter, view/edit/delete actions, empty state.
- **AdminCreate / AdminEdit** — `useAuthGuard()`. Two near-identical copies of the same form (a deliberate choice over one conditional component). Custom Czech date picker, debounced Nominatim address autocomplete restricted to the Plzeň region generating the OpenStreetMap `mapSrc`, image dropzones. `AdminCreate` deletes the just-created event if the image upload fails; `AdminEdit` deliberately does not.

### Styling

Plain CSS co-located with each component/page — no CSS modules, no Tailwind. Tokens live in `frontend/src/index.css` (`:root`) and `frontend/src/styles/category-tokens.css`. **Never hardcode hex/px/timing in a component — always `var(--token)`.** Selectors lean heavily on `id`s (`#site-header`, `#detail-hero`) with classes for repeated elements.

Fonts in use: **Inter** (`--font-sans`) and **Bricolage Grotesque** (`--font-display`), both from Google Fonts in `frontend/index.html`. `Montserrat` (loaded) and `KronaOne` (`@font-face` in `index.css`) are dead leftovers — no CSS references them.

`#root` is a flex column (`min-height: 100vh`) so the footer sticks to the bottom.

### Component conventions

- Source files are `.jsx` (not `.tsx`) — TypeScript is present for the build step only.
- Each component lives in its own folder under `frontend/src/components/` with a matching CSS file; each page under `frontend/src/pages/` likewise. Shared imports use `../../` relative paths.
