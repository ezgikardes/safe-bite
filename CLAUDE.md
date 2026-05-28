# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Architecture

**safe-bite** is a React + TypeScript food safety app that uses the Open Food Facts API to let users search food products, flag safe foods, and track personal trigger ingredients.

### Routing & Layout

All routes are wrapped by a single `Layout` component (`src/components/Layout.tsx`) which renders `Header`, `Sidebar`, and `<Outlet />`. Routes are defined in `src/App.tsx`:

| Path                    | Page                         |
| ----------------------- | ---------------------------- |
| `/`                     | Home                         |
| `/search`               | Search products              |
| `/my-favorite-products` | Saved favorite products      |
| `/my-triggers`          | Personal trigger ingredients |
| `/about`                | About                        |
| `/product/:id`          | Product detail               |

### API Integration (Open Food Facts)

Two Vite dev proxy rules handle CORS — never call these domains directly from the frontend:

- `/api/*` → `https://world.openfoodfacts.org` — product lookups by barcode/id
- `/search-api/*` → `https://search.openfoodfacts.org` — full-text product search

### Key Dependencies

- **React Router v7** — client-side routing
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (configured in `vite.config.ts`, not `postcss.config`)
