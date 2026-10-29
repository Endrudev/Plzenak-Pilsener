# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## How we work on this project — READ FIRST

There is a companion Obsidian vault, `Plzenak-Pilsener-docs`, sitting next to this repo (sibling folder). Its `README.md` states the hard rule for this project, and it overrides default Claude Code behavior:

This project exists purely for the author's (ondra.stindl@gmail.com) own learning. **The boundary of what Claude may do has moved three times as the author's understanding grew — do not assume an older version of the rule.** Current split, effective 2026-10-19:

| Area | Who |
|---|---|
| Frontend (visual and application/state logic) | **Claude** (visual since 2026-08-08, logic since 2026-08-27) |
| Backend (routes, SQL, data handling, validation) | **Claude** (since 2026-08-27) |
| **CI/CD, DevOps, infrastructure** (Docker, Compose, Nginx, Caddy, workflows, deployment) | **Claude** (since 2026-10-19) |
| Documentation (vault, this file, README) | **Claude** |
| Technical decisions | **Claude decides** and explains why (what was considered, what was rejected) |
| Decisions with lasting or external consequences | **the author** — Claude asks first, with a recommendation |

"Lasting or external consequences" means: a new third-party service or account, anything touching personal data, money, irreversible production actions (deleting data, DNS, access and secrets), or changing what the product does or how it looks to visitors. Everything else Claude does on its own and explains afterwards.

**What never changes:**

- **Explain everything you do.** Not "done" — what exactly you did, why, how it works, which decisions are baked into it. The author wants to understand the project in detail; speed is not worth losing that.
- When the author is unsure how something works, **teach it** — principle, small isolated example, then the code.
- The **docs vault** is Claude's to maintain (decisions, plan changes, journal entries).

## Working with the documentation

**The vault is the source of truth. This file and the repo `README.md` are derived** — when they disagree with the vault, the vault wins and the derived copy gets fixed.

The rules for maintaining the vault — document header, the four genres, the source-of-truth table, update triggers and a pre-merge checklist — live in **`00 Jak vést dokumentaci.md`** at the vault root. Read it before writing anything into the vault.

### Before you start a task

Open the page that owns the area you're touching. The full index is the vault `README.md`; the short version:

| Working on | Read first |
|---|---|
| Anything, first time in a session | `01 Projekt/Přehled.md` |
| Running the app, env vars, scripts | `01 Projekt/Vývojářský start.md` |
| Endpoints, params, status codes | `03 Backend/API.md` |
| Backend internals, filter/sort SQL | `03 Backend/Přehled.md` |
| DB schema, migrations | `03 Backend/Databáze.md` |
| Auth, validation, rate limiting | `03 Backend/Bezpečnost.md` |
| Images, R2 | `03 Backend/Obrázky a úložiště.md` |
| Routes, pages, header | `02 Frontend/Routing a stránky.md` |
| Frontend structure, state, conventions | `02 Frontend/Architektura.md` |
| CSS, tokens, components | `02 Frontend/Styling a komponenty.md` |
| Search, filters, sorting on `/akce` | `02 Frontend/Filtrování a hledání.md` |
| Cookie consent | `02 Frontend/Souhlas a cookies.md` |
| Personal data, GDPR | `01 Projekt/Osobní údaje a GDPR.md` |
| Tests | `04 DevOps/Testy.md` |
| Docker, Compose, pipeline | `04 DevOps/Nasazení a CI.md` |
| Backups, logs, ops | `04 DevOps/Provoz a data.md` |
| Secrets, Doppler, Trello (**read before any `doppler` command**) | `06 Nástroje/Doppler a Trello.md` |
| **Why is X the way it is** | `01 Projekt/Rozhodnutí.md` → `05 Poznámky/Deník.md` |
| What's planned / deferred | `01 Projekt/Launch checklist.md`, `01 Projekt/Po launchi.md` |

`05 Poznámky/Studijní zápisky/` holds dated code walkthroughs. They **deliberately go stale — never cite them as fact.**

### After you finish a task

Check whether the change requires a documentation update, and if so **make it in the same session**. The trigger table is in `00 Jak vést dokumentaci.md`; the ones that come up most:

- new/changed endpoint, param, status code → `03 Backend/API.md`
- new migration → `03 Backend/Databáze.md`
- new env variable → `.env.example` **and** `01 Projekt/Vývojářský start.md`
- new component → component table in `02 Frontend/Styling a komponenty.md`
- new route or page → `02 Frontend/Routing a stránky.md`
- anything sent to a third party → `01 Projekt/Osobní údaje a GDPR.md`
- a decision was made → `05 Poznámky/Deník.md` **and** a row in `01 Projekt/Rozhodnutí.md`
- a known gap got fixed → tick it off in the plan **and** update the topic page
- behaviour described in this file changed → **this file**

Then bump `aktualizováno` in the header of every page you touched.

> The vault is a **separate git repository**, so documentation cannot be updated in the same pull request as the code. Nothing enforces it — no CI, no reviewer. It holds only because of this instruction. (Docs CI was considered and deliberately rejected on 2026-08-28 — see the journal.)

## Commands

Full setup, env vars and troubleshooting: `01 Projekt/Vývojářský start.md` in the vault.

```bash
# frontend/
npm run dev         # dev server at http://localhost:5173
npm run build       # TypeScript check + Vite production build
npm test            # Vitest, single run (this is what CI runs)

# backend/
npm run dev       # nodemon index.js — Express API at http://localhost:3001
npm run migrate   # apply pending SQL migrations (schema_migrations tracking)
npm run seed      # create admin account from ADMIN_EMAIL/ADMIN_PASSWORD in .env
npm test          # node --test — unit tests of pure functions in src/lib/
```

No linter on either side. Tests: Vitest in `frontend/`, Node's built-in `node --test` in `backend/` (`npm test` in each; CI runs both). For manual development PostgreSQL runs as a standalone Docker container. The whole stack also runs from `docker-compose.yml` in the repo root: `doppler run --project plzenak --config dev -- docker compose up -d --build` (secrets come from Doppler, there is no root `.env`; details in `04 DevOps/Nasazení a CI.md`). Since 2026-10-15 the stack has Caddy in front of Nginx bound to `plzenak.eu`, so locally `docker compose up` no longer serves `http://localhost`; local development stays on the two `npm run dev` servers. **Never run `docker compose config` or `doppler secrets download` through Doppler — they print secret values.**

## Git workflow and CI

Work goes through **branches and pull requests**, never straight to `main` (`typ/popis` naming, e.g. `feat/`, `fix/`, `ci/`, `refactor/`, `test/`, `chore/`). The repo allows **squash merging only**, deletes head branches automatically, and prefills the squash commit from the PR title and description — so PR titles read like commit messages.

`.github/workflows/ci.yml` runs on every pull request, on pushes to `main`, and manually via Run workflow (`workflow_dispatch`), in two parallel jobs: **frontend** (`npm ci` → `npm test` → `npm run build`) and **backend** (`npm ci` → `npm test` → `node --check` over every `.js`; the syntax check stays because tests only import `lib/`). Node version comes from `.nvmrc`. The whole file runs with `TZ: UTC` and `permissions: contents: read`, and a `concurrency` group keyed by workflow and branch cancels superseded runs. A separate workflow `.github/workflows/cd.yml` runs after a green CI on `main` and deploys the tested commit (own `concurrency` group that never cancels a running deploy). What's still missing (branch protection, deploy notifications) is in `04 DevOps/Nasazení a CI.md`.

## Purpose

Event Hub is a city event aggregator for Plzeň (brand: **Plzeňák** CS / **Pilsener** EN). It is a CRUD application — admins add, edit, and delete events; visitors browse and view them.

**User flow (public):** Home → browse/filter events → event detail
**Admin flow:** Footer "Admin log in" → `/admin` → `/admin/dashboard` → `/admin/create` or `/admin/edit/:id`

## Architecture — orientation only

Enough to know where to look. **Details live in the vault pages listed above** — don't restate them here, or this file will drift out of sync again.

React 18 SPA (`frontend/`) built with Vite, talking to a Node.js/Express + PostgreSQL API (`backend/`), with event images in Cloudflare R2. Supabase is fully removed. Routing via react-router-dom v7.

- **Routing** — `<Layout>` in `App.jsx` suppresses `Header`, `Footer` **and the cookie banner** on all `/admin*` routes. `<Route path="*">` must stay last.
- **Backend** — Express + `pg`, no ORM, raw parametrized SQL by design. `dotenv.config()` must run before anything reading `process.env`. `GET /locations` must stay above `GET /:id`. Auth is JWT, no sessions, `authMiddleware` attached per-route.
- **Data mapping** — DB columns are `snake_case`, API/frontend `camelCase`; mapping happens on the backend (`mapEvent`/`mapEventReverse`). Every page fetches through `frontend/src/lib/eventsApi.js`.
- **Images** — `imageUrl` (R2) takes precedence over `imgClass` (CSS gradient) everywhere. Never build a `url()` by hand — always `lib/imageBackground.js`.
- **Consent** — `localStorage` key `plzenak-consent`, versioned by `CONSENT_VERSION`; missing/invalid/outdated = undecided. No analytics category, deliberately: visitor analytics (Umami, self-hosted at `stats.plzenak.eu`, no cookies, no stored IP) runs without consent on legitimate interest, with a per-browser opt-out on the privacy page (`localStorage` key `umami.disabled`, `lib/analytics.js`, `MeasurementOptOut`). The tag in `index.html` must keep Do Not Track, `data-domains` and the admin exclusion — a test checks it. Fonts are self-hosted (`frontend/src/assets/fonts/`); nothing third-party loads before consent — a test guards `index.html` and CSS against Google Fonts links coming back.
- **Production** — AWS EC2 (Stockholm) behind Caddy (HTTPS) → Nginx → backend at `https://plzenak.eu`; Cloudflare for DNS, R2 and e-mail routing. **Deploys are automatic** (since 2026-10-19): a merge to `main` that passes CI is deployed by `.github/workflows/cd.yml` over SSH, which runs `ops/deploy.sh <SHA>` on the server (build, migrate, health check, rollback on failure). **Never `git pull` on the server** — it stays on a detached SHA and is only moved by `deploy.sh`. Secrets from Doppler config `prd`. Details: `04 DevOps/Nasazení a CI.md`.
- **Admin** — since 2026-10-29 every admin page except login sits in `components/admin/AdminShell` (own glass bar, bottom nav on phones) and uses the homepage light/dark theme (`--lp-*` tokens, `useAdminTheme`). Create and edit share one `components/admin/EventForm`; the pages only handle saving. The list comes from the protected `GET /api/events/admin` (past events included), never from the public `GET /api/events` (upcoming only, max 100). Pure logic with tests lives in `lib/admin/`. Details: `02 Frontend/Routing a stránky.md` and the Administrace section in `Styling a komponenty.md`.
- **Event import** — new events can arrive through a review queue (`event_candidates`, `/api/candidates`, admin page `/admin/candidates`): an importer with a narrow token posts proposals, an admin approves them, approval copies the image from `akce.plzen.eu` into R2. Details: `03 Backend/API.md`.
- **SEO renderer** — every non-`/api` `GET` reaching the backend is rendered by `backend/src/routes/render.js` (`lib/seo/`): `index.html` fetched from Nginx (`SITE_TEMPLATE_URL`, cached 60 s) plus title, meta, canonical, Open Graph, JSON-LD and plain HTML in `#root`, with real `301`/`404`. All DB text goes through `escapeHtml`/`jsonLdScript`. Page titles exist twice (`lib/seo/site.js` and `frontend/src/lib/pageTitle.js`) — a new public page needs both, a test checks they match. Details: `03 Backend/Přehled.md`.

### Component conventions

- Source files are `.jsx` (not `.tsx`) — TypeScript is present for the build step only.
- Each component lives in its own folder under `frontend/src/components/` with a matching CSS file; each page under `frontend/src/pages/` likewise. Shared imports use `../../` relative paths.
- Plain CSS, no CSS modules, no Tailwind. Tokens in `frontend/src/index.css` (`:root`) and `frontend/src/styles/category-tokens.css`. **Never hardcode hex/px/timing in a component — always `var(--token)`.** Selectors lean on `id`s (`#site-header`, `#detail-hero`) with classes for repeated elements.
- `frontend/src/data/events.js` is orphaned pre-API mock data, imported nowhere.
