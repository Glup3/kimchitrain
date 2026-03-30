# AGENTS.md — Kimchi Train

## Project Overview

Full-stack food-ordering app built with **TanStack Start** (SSR/meta framework), **React 19**, **Zero** (realtime sync via `@rocicorp/zero`), **Drizzle ORM** (PostgreSQL), and **Tailwind CSS v4**. File-based routing via TanStack Router.

## Build / Dev / Test Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build (vite build)
npm run preview      # Preview production build

# Linting & Formatting
npm run lint         # Run oxlint (fast JS/TS linter)
npm run lint:ts      # Type-check with tsgo (--noEmit)
npm run fmt          # Auto-fix formatting with oxfmt

# Testing
npm run test         # Run all tests with vitest
npx vitest run src/path/to/file.test.ts   # Run a single test file
npx vitest run --reporter=verbose         # Run with verbose output

# Database
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to DB
npm run db:studio    # Open Drizzle Studio
npm run db:zero      # Generate Zero schema from Drizzle schema
```

**Before committing changes**, always run:

```bash
npm run fmt:fix && npm run lint && npm run lint:ts
```

## Formatting (oxfmt)

Configured in `.oxfmtrc.json`:

- **No semicolons** (`semi: false`)
- **Single quotes** (`singleQuote: true`)
- **Tabs** for indentation (`useTabs: true`)
- **Print width**: 120
- Imports are auto-sorted (`sortImports`)
- Tailwind classes are auto-sorted (`sortTailwindcss`)
- Ignored: `routeTree.gen.ts`, `zero-schema.ts`

## Import Aliases

`tsconfig.json` defines two path aliases that map to `./src/*`:

- `#/*` — primary alias used throughout the codebase
- `@/*` — secondary alias, also available

```ts
import { cn } from '#/lib/utils'
import { env } from '#/env'
import type { Dish } from '#/db/zero-schema'
```

## Project Structure

```
src/
  components/        # React components (PascalCase files)
    analytics/       # Chart/visualization components
  db/
    schema.ts        # Drizzle ORM table definitions
    zero-schema.ts   # Auto-generated Zero schema (do not edit)
    index.ts         # DB/Zero provider setup
  hooks/             # Custom React hooks (camelCase files)
  lib/
    format.ts        # Formatting utilities
    mutators.ts      # Zero mutation definitions
    queries.ts       # Zero query definitions
    utils.ts         # Shared utilities (cn, etc.)
  routes/            # TanStack Router file-based routes
    __root.tsx       # Root layout + ZeroProvider
    api.mutate.ts    # Zero sync API endpoint
    api.query.ts     # Zero query API endpoint
    index.tsx        # Home page
    archive.tsx      # Archive page
    analytics.tsx    # Analytics page
    train/$orderId.tsx  # Dynamic route
  env.ts             # Environment variable config (@t3-oss/env-core)
  router.tsx         # Router instance
  styles.css         # Global styles + Tailwind + CSS custom properties
```

## Code Style & Conventions

### Components

- **PascalCase** file names for components (`OrderRow.tsx`, `DishCard.tsx`)
- **camelCase** file names for utilities, hooks, non-component modules
- Components use either **default exports** (`export default function`) or **named exports** (`export function`)
- Route files always `export const Route = createFileRoute(...)(...)`

### TypeScript

- `strict: true` with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- Use `interface` for component props (`interface DishCardProps`)
- Use `export type` for exported types (`export type OrderRowProps`)
- Zod (`zod` v4) for runtime validation of mutator args and env vars

### Styling

- **Tailwind CSS v4** with utility classes — no CSS modules or styled-components
- Theme uses **CSS custom properties** (`--sea-ink`, `--lagoon`, `--palm`, etc.) defined in `src/styles.css`
- Dark mode via `[data-theme='dark']` attribute + `prefers-color-scheme` media query
- Use `cn()` utility (clsx + tailwind-merge) for conditional class composition
- Use `text-[var(--sea-ink)]` pattern for theme-aware colors

### Data Layer

- **Drizzle ORM** for PostgreSQL schema definition (`src/db/schema.ts`)
- **Zero** handles realtime sync and local-first state (`@rocicorp/zero`)
- **Mutators** defined in `src/lib/mutators.ts` using `defineMutator` with Zod schemas
- **Queries** defined in `src/lib/queries.ts` using `defineQuery`/`defineQueries`
- Use `useQuery` and `useZero` hooks from `@rocicorp/zero/react`
- IDs: ULID for order/orderItem IDs, integer for dishes/dishGroups

### Environment Variables

- Managed via `@t3-oss/env-core` in `src/env.ts`
- Server vars: `ZERO_UPSTREAM_DB`
- Client vars: prefixed with `VITE_` (e.g., `VITE_ZERO_SERVER`)
- Import with `import { env } from '#/env'`

### React Patterns

- Functional components only
- Hooks follow `use*` naming convention
- `type="button"` on all non-submit buttons
- `void` prefix for fire-and-forget promises: `void navigate(...)`

### Error Handling

- Use `try/catch` with empty catch for non-critical localStorage operations
- Let Zero handle sync errors transparently
- Use Zod validation at mutation boundaries

## Generated Files (Do Not Edit)

- `src/routeTree.gen.ts` — auto-generated by TanStack Router
- `src/db/zero-schema.ts` — auto-generated by `drizzle-zero`

## Key Dependencies

| Purpose        | Package                             |
| -------------- | ----------------------------------- |
| Meta-framework | `@tanstack/react-start`             |
| Routing        | `@tanstack/react-router`            |
| Realtime sync  | `@rocicorp/zero`                    |
| ORM            | `drizzle-orm`                       |
| Validation     | `zod` v4                            |
| Icons          | `lucide-react`                      |
| Charts         | `recharts`                          |
| Guided tours   | `react-joyride`                     |
| CSS            | `tailwindcss` v4                    |
| Env vars       | `@t3-oss/env-core`                  |
| Testing        | `vitest` + `@testing-library/react` |
| Linting        | `oxlint`                            |
| Formatting     | `oxfmt`                             |
| Type checking  | `tsgo` (TypeScript native preview)  |
