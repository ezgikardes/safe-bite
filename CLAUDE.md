# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout (monorepo)

```
frontend/   React + TypeScript + Vite app (run npm here)
backend/    Spring Boot 3 (Java 17) REST API (run ./mvnw here)
docs/       specs & plans
```

## Commands

Frontend (run from `frontend/`):

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

Backend (run from `backend/`):

```bash
./mvnw test              # Run tests (H2 in-memory)
./mvnw spring-boot:run   # Start API on http://localhost:8080 (needs local Postgres)
```

## Architecture

**safe-bite** is a React + TypeScript food safety app that uses the Open Food Facts API to let users search food products, flag safe foods, and track personal trigger ingredients. A Spring Boot backend (`backend/`) provides email/password + JWT auth.

### Routing & Layout

All routes are wrapped by a single `Layout` component (`frontend/src/components/Layout.tsx`) which renders `Sidebar` and `<Outlet />`. Routes are defined in `frontend/src/App.tsx`:

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
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (configured in `frontend/vite.config.ts`, not `postcss.config`)
