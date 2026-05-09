# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build locally
```

No linting or test tooling is configured.

## Architecture

React 18 SPA built with Vite. Routing via react-router-dom v7. No backend — all data is static.

### Routing (`src/App.jsx`)

| Route | Component |
|---|---|
| `/` | `Home` |
| `/events` | `Events` |
| `/events/:id` | `EventDetail` |

`Header` and `Footer` are rendered at App level (outside `<Routes>`), so they appear on every page. `Header` uses `useLocation` to apply one of three variants:

| Class | Route | Behaviour |
|---|---|---|
| `header--hero` | `/` | Background image + big logo, height 350px, normal flow |
| `header--dark` | `/events/:id` | `position: absolute` over the hero, dark-to-transparent gradient — does **not** push content down |
| *(none)* | everything else | Solid orange `#FAA52F`, normal flow |

Because `header--dark` is `position: absolute`, the EventDetail hero (`height: 280px`) is sized to visually include the nav bar area (65px) on top.

### Data (`src/data/events.js`)

Single source of truth for all event objects. Imported by `Home`, `Events`, and `EventDetail`. Each event has:
- `id`, `name`, `date`, `dateShort`, `location`, `badge`, `badgeType`, `imgClass`
- `url`, `description[]`, `mapSrc` — used only on the detail page

### Styling

Plain CSS files co-located with each component/page — no CSS modules, no Tailwind. Global resets and font-face in `src/index.css`. `#root` is a flex column (`min-height: 100vh`) so the footer always sticks to the bottom.

Two fonts:
- `KronaOne` — local TTF at `src/assets/fonts/`, used for headings and buttons
- `Montserrat` — loaded from Google Fonts (in `index.html`), used for body text

Event image backgrounds are CSS gradients via classes defined in `src/components/EventCard/EventCard.css` (`.event-image--majales`, `.event-image--sklo`, `.event-image--prazdroj`). Add new gradient classes there when adding new event types.

### Component conventions

- Source files are `.jsx` (not `.tsx`) despite TypeScript being listed as a dev dependency — the TS config is present for the build step only.
- Each component lives in its own folder under `src/components/` with a matching CSS file.
- Each page lives in its own subfolder under `src/pages/` (e.g. `src/pages/Home/Home.jsx`) with a co-located CSS file. Imports to shared code use `../../` relative paths.