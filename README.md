# SafeBite

> Your reflux & gastritis buddy. Scan or search any product to see if it's safe for you.

SafeBite is a React + TypeScript web app that lets people living with food sensitivities — especially reflux and gastritis — check products against a personal list of trigger ingredients. Add your triggers once, then scan a barcode or search by name and get an instant safe / caution / risky assessment.

## Why this exists

After a reflux diagnosis I spent months on a low-acid diet, struggling to figure out which ingredients were causing flare-ups. I worked with a specialist dietitian for reflux and gastritis and would not have figured it out without her. SafeBite is meant to make the day-to-day "can I eat this?" question faster for anyone going through the same trial and error — not to replace medical advice, but to take some of the cognitive load off label reading.

## Features

- **Personal trigger list** — Add and remove ingredients you want to avoid; stored locally in the browser.
- **Barcode scanning** — Camera-based scanner using `html5-qrcode`. Detected barcode opens the product page automatically.
- **Manual barcode entry** — For when the camera can't read a code, with format validation.
- **Search** — Full-text search across the Open Food Facts database.
- **Product detail** — Image, brand, name, traffic-light safety badge (safe / caution / risky), trigger warnings, nutrient levels, and full ingredients.
- **Favorites** — Save trusted products for quick access.
- **Form validation** — Required + duplicate-check on trigger entry, with friendly error messages.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (build tool, dev server)
- **React Router v7** (client-side routing, dynamic routes)
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, custom theme tokens in `index.css`)
- **React Hook Form** (form state, validation)
- **html5-qrcode** (camera barcode scanning)
- **lucide-react** (icons)
- **Open Food Facts API** (product data — free, collaborative database)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint     # ESLint
npm run preview  # preview production build
```

## Project structure

```
src/
  components/
    Header.tsx              Top bar with search
    Layout.tsx              Sidebar + main + footer wrapper
    ProductCard.tsx         Reusable product card with favorite button
    Sidebar.tsx             Left navigation
  context/
    TriggerContext.tsx      createContext + type definition
    TriggerProvider.tsx     Provider component with localStorage sync
  hooks/
    useTriggers.ts          Custom hook to access trigger context
  pages/
    Home.tsx                Hero + "How it works" steps
    Scan.tsx                Camera scanner + manual barcode entry
    Search.tsx              Full-text product search
    ProductDetail.tsx       Product info, safety badge, triggers, nutrients
    MyTriggers.tsx          Trigger ingredient management (React Hook Form)
    MyFavoriteProducts.tsx  Saved favorites grid
  constants/
    triggers.ts             Pre-loaded default triggers
  utils/
    getSafetyLevel.ts       Returns "safe" | "caution" | "risky" for a product
  types.ts                  Shared TypeScript types
```

## Routes

| Path                    | Page                         |
| ----------------------- | ---------------------------- |
| `/`                     | Home                         |
| `/scan`                 | Barcode scanner              |
| `/search`               | Search products              |
| `/my-favorite-products` | Saved favorites              |
| `/my-triggers`          | Personal trigger ingredients |
| `/product/:id`          | Product detail               |

## API integration

Two Vite dev proxy rules (in `vite.config.ts`) handle CORS — the frontend never calls these domains directly:

- `/api/*` → `https://world.openfoodfacts.org` (product lookups by barcode)
- `/search-api/*` → `https://search.openfoodfacts.org` (full-text search)

Product data is provided by [Open Food Facts](https://world.openfoodfacts.org), a free and collaborative food product database.

## Architecture notes

**Context + custom hook.** `TriggerProvider` wraps the app in `App.tsx`. The trigger list is held in a single `useState`, kept in sync with `localStorage` via `useEffect`, and exposed through `useTriggers()`. Any component that needs to read triggers or call `addTrigger` / `removeTrigger` imports the hook — no prop drilling.

**Form handling.** `MyTriggers.tsx` uses `useForm<FormValues>()` with `register`, `handleSubmit`, `reset`, and `formState.errors`. Validation rules live on the `register` call (`required` + a `validate` function that checks for duplicates). `reValidateMode: "onSubmit"` keeps errors from re-firing while the user is still typing.

**Safety classification.** `getSafetyLevel(product)` merges the built-in trigger constants with the user's saved triggers, then classifies the product as `risky` (contains a trigger), `caution` (high in fat / salt / sugars / saturated fat), or `safe`.

## Disclaimer

SafeBite is a self-tracking tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider or registered dietitian about your individual dietary needs.

## Acknowledgments

- Product data: [Open Food Facts](https://world.openfoodfacts.org)
- Icons: [Lucide](https://lucide.dev)
- Built as a final project for the ReDI School Web Development program.
