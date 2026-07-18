# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How we work on this project — READ FIRST

There is a companion Obsidian vault, `Plzenak-Pilsener-docs`, sitting next to this repo (sibling folder). Its `README.md` states the hard rule for this project, and it overrides default Claude Code behavior:

- This project exists purely for the author's (ondra.stindl@gmail.com) own learning. **The author writes all production code, config, and infrastructure themselves.**
- Claude's role is **strictly advisory**: explain concepts, review code, propose alternatives, help debug, discuss architecture/plans — never hand over a finished implementation to paste in.
- Do not write or edit application code (frontend, backend, infra, Dockerfiles, etc.) unless explicitly asked to for a specific, narrow reason. Default to explaining/reviewing instead of editing.
- The **docs vault itself is the exception** — Claude may read and keep it updated (new decisions, plan changes, journal entries) as documentation, since that's not production code.
- See the vault for full context: `01 Projekt/Přehled.md` (overview), `04 DevOps/Migrace ze Supabase.md` (migration plan/status), `05 Poznámky/Deník.md` (running decision log).

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally
```

No linting or test tooling is configured.

## Purpose

Event Hub is a city event aggregator for Plzeň. It is a CRUD application — admins add, edit, and delete events; visitors browse and view them.

**User flow (public):** Home → browse events → event detail page  
**Admin flow:** Footer "Admin Log in" → `/admin` (login) → `/admin/dashboard` (event table) → `/admin/create` (new event) or edit/delete actions

## Architecture

React 18 SPA built with Vite. Routing via react-router-dom v7. Currently no backend — all data is static in `src/data/events.js`. The admin CRUD UI is fully built but not yet wired to a real database.

### Routing (`src/App.jsx`)

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

### Database (Supabase)

PostgreSQL přes Supabase. Připojení v `src/lib/supabase.js`, CRUD operace v `src/lib/eventsApi.js`.

**Tabulka `events`** — schéma v `supabase_schema.sql`. RLS je vypnuté (`alter table events disable row level security`) a nahrazeno přímými granty:
```sql
grant all on events to anon, authenticated;
grant usage on sequence events_id_seq to anon, authenticated;
```
Důvod: nový formát Supabase publishable key (`sb_publishable_...`) není kompatibilní s RLS v supabase-js v2 — PostgREST nedokáže ověřit JWT, `auth.uid()` vrací NULL. Pro produkci je potřeba buď přejít na supabase-js v3, nebo použít klasický JWT anon key.

**Auth:** Přihlášení přes `supabase.auth.signInWithPassword()`. Auth guard (`src/lib/useAuthGuard.js`) chrání `/admin/dashboard` a `/admin/create`.

### Data (`src/data/events.js`)

Single source of truth for all event objects. Imported by `Home`, `Events`, and `EventDetail`. Each event has:
- `id`, `name`, `date`, `dateShort`, `location`, `tags[]`, `badge`, `badgeType`, `imgClass`
- `url`, `description[]`, `mapSrc` — used only on the detail page

`tags[]` (e.g. `['Kultura', 'TOP akce']`) and `location` are rendered inside `EventCard`.

### Admin pages (`src/pages/Admin*`)

All three admin pages suppress the global Header/Footer and share the same gray (`#e0dede`) background and "Zpět" back-button style.

- **Admin** — login form (username + password + Přihlásit → navigates to dashboard)
- **AdminDashboard** — paginated table (10/page) of all events with search filter and three action buttons per row: view (blue), edit (orange), delete (red). "Create new" navigates to AdminCreate.
- **AdminCreate** — form to create a new event: Nadpis, date picker (Czech format), Popis textarea, URL, Kategorie select, Název lokace, main image button, Adresa with autocomplete, two image upload boxes, Zobrazit (preview) and Uložit (save) buttons.
- **AdminCreate** saves via `createEvent()` from `src/lib/eventsApi.js` → Supabase `events` table.
  - **Date picker** — custom calendar popup (Czech day/month names, Monday-start grid, month navigation). The field next to the calendar icon is also directly editable in `d.m.rrrr` format. The X button navigates back (same as Zpět).
  - **Address autocomplete** — debounced (400ms) Nominatim API call. Results are restricted to Plzeňský kraj via `viewbox=12.65,50.02,13.92,49.15&bounded=1&countrycodes=cz` plus a client-side filter requiring "plzeň" in `display_name`. Selecting a suggestion fills the field and generates an OpenStreetMap embed URL (`mapSrc`) shown as a live map preview. The same `mapSrc` format is used in EventDetail for the embedded map.

### Styling

Plain CSS files co-located with each component/page — no CSS modules, no Tailwind. Global resets and font-face in `src/index.css`. `#root` is a flex column (`min-height: 100vh`) so the footer always sticks to the bottom.

Two fonts:
- `KronaOne` — local TTF at `src/assets/fonts/`, used for headings and buttons
- `Montserrat` — loaded from Google Fonts (in `index.html`), used for body text

Event image backgrounds are CSS gradients via classes defined in `src/components/EventCard/EventCard.css` (`.event-image--majales`, `.event-image--sklo`, `.event-image--prazdroj`). Add new gradient classes there when adding new event types.

### Ongoing: DevOps migration (Supabase → own stack)

**Status:** In progress — currently on Step 4 of 13 (completed: 1–4). Full plan in Claude memory (`devops-migration-plan`).

Supabase is being replaced with: Node.js/Express API (`backend/`) + PostgreSQL (Docker) + Nginx frontend. All three services will run via Docker Compose.

Key files changing:
- `src/lib/supabase.js` → delete
- `src/lib/eventsApi.js` → rewrite to fetch
- `src/lib/useAuthGuard.js` → JWT from localStorage
- `src/pages/Admin/Admin.jsx` → fetch `/api/auth/login`

New `backend/` folder is a separate Node.js project with its own `package.json`. Do not confuse it with the root frontend project.

---

### Component conventions

- Source files are `.jsx` (not `.tsx`) despite TypeScript being listed as a dev dependency — the TS config is present for the build step only.
- Each component lives in its own folder under `src/components/` with a matching CSS file.
- Each page lives in its own subfolder under `src/pages/` (e.g. `src/pages/Home/Home.jsx`) with a co-located CSS file. Imports to shared code use `../../` relative paths.