# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How we work on this project — READ FIRST

There is a companion Obsidian vault, `Plzenak-Pilsener-docs`, sitting next to this repo (sibling folder). Its `README.md` states the hard rule for this project, and it overrides default Claude Code behavior:

- This project exists purely for the author's (ondra.stindl@gmail.com) own learning. **The author writes all backend code, database logic, infrastructure, and frontend application/state logic themselves.**
- Claude's role there is **strictly advisory**: explain concepts, review code, propose alternatives, help debug, discuss architecture/plans — never hand over a finished implementation to paste in.
- Do not write or edit backend code, database/infra config, or frontend application logic (state, hooks, data fetching, API wiring, validation) unless explicitly asked to for a specific, narrow reason. Default to explaining/reviewing instead of editing.
- **Exception (added 2026-08-08): frontend visual/design code** (CSS, JSX layout/markup, redesign work from screenshots/mockups) is carved out of the rule above — the author already has design experience elsewhere, so writing it by hand teaches nothing new, unlike backend/DB/frontend-logic where they're a beginner. Claude **may write this code directly**. The line: the moment application/state logic (`useState`, `useEffect`, `fetch`, data handling, validation) shows up in a file alongside visuals, that logic still falls under the advisory-only rule above — the author writes it. When unsure which bucket something falls into, ask first.
- The **docs vault itself is also an exception** — Claude may read and keep it updated (new decisions, plan changes, journal entries) as documentation, since that's not production code.
- See the vault for full context: `01 Projekt/Přehled.md` (overview), `04 DevOps/Migrace ze Supabase.md` (migration plan/status), `05 Poznámky/Deník.md` (running decision log).

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

No linting or test tooling is configured on either side.

## Purpose

Event Hub is a city event aggregator for Plzeň. It is a CRUD application — admins add, edit, and delete events; visitors browse and view them.

**User flow (public):** Home → browse events → event detail page  
**Admin flow:** Footer "Admin Log in" → `/admin` (login) → `/admin/dashboard` (event table) → `/admin/create` (new event) or edit/delete actions

> [!known gaps] Edit action is wired in the UI but has no route/page yet (backend `PUT` endpoint works, nothing calls it). Image upload in `AdminCreate` is a local-preview-only stub — nothing is persisted. See the docs vault for the full, currently-maintained list.

## Architecture

React 18 SPA (`frontend/`) built with Vite, talking to a Node.js/Express + PostgreSQL API (`backend/`) — **not** Supabase, that migration is complete. Routing via react-router-dom v7.

### Routing (`frontend/src/App.jsx`)

Routing is handled inside a `<Layout>` component (inside `<BrowserRouter>`) that uses `useLocation` to conditionally suppress `Header`/`Footer` on all `/admin*` routes.

| Route | Component | Header/Footer |
|---|---|---|
| `/` | `Home` | ✓ |
| `/events` | `Events` | ✓ |
| `/events/:id` | `EventDetail` | ✓ |
| `/admin` | `Admin` (login) | ✗ |
| `/admin/dashboard` | `AdminDashboard` | ✗ |
| `/admin/create` | `AdminCreate` | ✗ |

`Header` uses `useLocation` to apply one of four variants:

| Class | Route | Behaviour |
|---|---|---|
| `header--hero` | `/` | Background image + dark gradient overlay + big logo, height 350px (420px on PC) |
| `header--dark` | `/events/:id` | `position: absolute` over the hero, dark-to-transparent gradient — does **not** push content down |
| `header--plain` | `/events` | Orange gradient reversed (`#C97000→#FFB830`) + search/filter hero section |
| *(gradient)* | everything else | Orange gradient `#FFB830→#C97000` |

Because `header--dark` is `position: absolute`, the EventDetail hero (`height: 280px`) is sized to visually include the nav bar area (65px) on top.

The Events page (`header--plain`) renders an extended hero inside the `<header>` with a search bar, three filter dropdowns (Kategorie, Místo, Datum) and a Vyhledat button.

On PC (≥1024px) the home page hides the small logo and shows a search input in the nav instead. Layout uses CSS grid (`1fr auto 1fr`) to keep "Domů" perfectly centred.

### Backend (`backend/`)

Separate Node.js project (own `package.json`) — Express API + PostgreSQL via `pg`, no ORM (raw parametrized SQL by design). See `Plzenak-Pilsener-docs/03 Backend/Přehled.md` for the full, actively-maintained writeup; summary:

- `index.js` — app entrypoint, mounts routers, `dotenv.config()` runs before anything that reads `process.env`
- `src/db/pool.js` — shared PostgreSQL connection pool, exposes a single `query(text, params)`
- `src/db/migrate.js` — applies pending migrations from `migrations/`, tracked in a `schema_migrations` table
- `src/db/seed.js` — creates the admin account from `.env`
- `src/routes/auth.js` — `POST /api/auth/login` (bcrypt password check, issues JWT)
- `src/routes/events.js` — full CRUD for `events`: `GET /`, `GET /:id` public; `POST /`, `PUT /:id`, `DELETE /:id` protected
- `src/middleware/authMiddleware.js` — verifies `Authorization: Bearer <token>`, attached per-route (not globally) so public reads stay unauthenticated

**Auth:** JWT-based, no sessions. Login issues a token (`jwt.sign`, 8h expiry); frontend stores it in `localStorage` and sends it back as `Authorization: Bearer <token>` on protected requests. `useAuthGuard()` (frontend) checks `localStorage` and redirects to `/admin` if missing.

**Data mapping:** DB columns are `snake_case` (`date_short`, `badge_type`...), API/frontend uses `camelCase`. Mapping happens **on the backend** (`mapEvent`/`mapEventReverse` in `events.js`) — the frontend never sees snake_case.

### Data

No static data file — every public page (`Home`, `Events`, `EventDetail`) fetches from the backend via `frontend/src/lib/eventsApi.js` (`getEvents()`, `getEventById(id)`, plus `createEvent`/`updateEvent`/`deleteEvent` for admin use). Each event has:
- `id`, `name`, `date`, `dateShort`, `location`, `tags[]`, `badge`, `badgeType`, `imgClass`
- `url`, `description[]`, `mapSrc` — used only on the detail page

`tags[]` (e.g. `['Kultura', 'TOP akce']`) and `location` are rendered inside `EventCard`. `frontend/src/data/events.js` still exists on disk but is no longer imported anywhere — orphaned leftover from the pre-API era.

### Admin pages (`frontend/src/pages/Admin*`)

All three admin pages suppress the global Header/Footer and share the same gray (`#e0dede`) background and "Zpět" back-button style.

- **Admin** — login form (email + password + Přihlásit). Calls `POST /api/auth/login` via `fetch`, stores the returned token in `localStorage`, then navigates to dashboard.
- **AdminDashboard** — `useAuthGuard()` guarded. Paginated table (10/page) of all events (via `getEvents()`) with search filter (name only, client-side) and three action buttons per row: view (blue, works), edit (orange, **navigates to `/admin/edit/:id` — that route doesn't exist yet**), delete (red, works via `deleteEvent()`). "Create new" navigates to AdminCreate.
- **AdminCreate** — `useAuthGuard()` guarded. Form to create a new event: Nadpis, date picker (Czech format), Popis textarea, URL, Kategorie select, Název lokace, main image button, Adresa with autocomplete, two image upload boxes, Zobrazit (preview) and Uložit (save) buttons.
- **AdminCreate** saves via `createEvent()` from `eventsApi.js` → `POST /api/events` on the own backend.
  - **Date picker** — custom calendar popup (Czech day/month names, Monday-start grid, month navigation). The field next to the calendar icon is also directly editable in `d.m.rrrr` format. The X button navigates back (same as Zpět).
  - **Address autocomplete** — debounced (400ms) Nominatim API call. Results are restricted to Plzeňský kraj via `viewbox=12.65,50.02,13.92,49.15&bounded=1&countrycodes=cz` plus a client-side filter requiring "plzeň" in `display_name`. Selecting a suggestion fills the field and generates an OpenStreetMap embed URL (`mapSrc`) shown as a live map preview. The same `mapSrc` format is used in EventDetail for the embedded map.
  - **Image upload is a non-functional stub** — `handleImage` only does `URL.createObjectURL(file)` for an in-browser preview; nothing is uploaded or persisted, and `handleSave()` never includes images in the `createEvent(...)` payload.

### Styling

Plain CSS files co-located with each component/page — no CSS modules, no Tailwind. Global resets and font-face in `frontend/src/index.css`. `#root` is a flex column (`min-height: 100vh`) so the footer always sticks to the bottom.

Two fonts:
- `KronaOne` — local TTF at `frontend/src/assets/fonts/`, used for headings and buttons
- `Montserrat` — loaded from Google Fonts (in `frontend/index.html`), used for body text

Event image backgrounds are CSS gradients via classes defined in `frontend/src/components/EventCard/EventCard.css` (`.event-image--majales`, `.event-image--sklo`, `.event-image--prazdroj`). Add new gradient classes there when adding new event types.

### Remaining DevOps work

The Supabase → own-stack migration itself is **done** (backend fully built, frontend rewired, Supabase fully removed). What's left is containerization and a handful of known feature gaps — full, actively-maintained status lives in the docs vault, **not** here:

- `Plzenak-Pilsener-docs/04 DevOps/Migrace ze Supabase.md` — checklist, known bugs/gaps, planned features (edit page, image persistence, search/filter, map view, 404 page, input validation, rate limiting, Docker Compose)
- `Plzenak-Pilsener-docs/05 Poznámky/Deník.md` — running decision log with dates and reasoning

Check those before assuming something is done or planned a certain way — this file gives orientation, the vault has the current truth.

---

### Component conventions

- Source files are `.jsx` (not `.tsx`) despite TypeScript being listed as a dev dependency — the TS config is present for the build step only.
- Each component lives in its own folder under `frontend/src/components/` with a matching CSS file.
- Each page lives in its own subfolder under `frontend/src/pages/` (e.g. `frontend/src/pages/Home/Home.jsx`) with a co-located CSS file. Imports to shared code use `../../` relative paths.