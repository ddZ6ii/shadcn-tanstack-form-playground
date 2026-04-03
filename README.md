# Vite + React + TypeScript + shadcn/ui + TanStack Form Playground

A playground for exploring form patterns with TanStack Form, Zod, and shadcn/ui.

## Stack

| Tool                                                      | Version | Purpose                         |
| --------------------------------------------------------- | ------- | ------------------------------- |
| [Vite](https://vite.dev)                                  | 7       | Build tool & dev server         |
| [React](https://react.dev)                                | 19      | UI framework                    |
| [TypeScript](https://www.typescriptlang.org)              | 5.9     | Type safety                     |
| [Tailwind CSS](https://tailwindcss.com)                   | 4       | Utility-first styling           |
| [shadcn/ui](https://ui.shadcn.com)                        | —       | Copy-paste component library    |
| [Radix UI](https://www.radix-ui.com)                      | —       | Accessible component primitives |
| [TanStack Form](https://tanstack.com/form)                | 1       | Headless form state management  |
| [Zod](https://zod.dev)                                    | 4       | Schema validation               |
| [Sonner](https://sonner.emilkowal.ski)                    | —       | Toast notifications             |
| [next-themes](https://github.com/pacocoursey/next-themes) | —       | Dark/light theme switching      |
| [Lucide React](https://lucide.dev)                        | —       | Icon library                    |
| [Vitest](https://vitest.dev)                              | 4       | Unit & component testing        |
| [Testing Library](https://testing-library.com)            | —       | DOM/React test utilities        |

**Tooling:** ESLint (strict TypeScript + React rules), Prettier (with Tailwind class sorting), pnpm.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io) 10 — `npm install -g pnpm`

## Getting Started

```bash
# 1. Clone / download this starter
git clone <repo-url> my-app
cd my-app

# 2. Install dependencies
pnpm install

# 3. Start the dev server (opens browser automatically)
pnpm dev
```

## Scripts

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `pnpm dev`           | Start dev server (opens browser)            |
| `pnpm build`         | Lint, type-check, then build for production |
| `pnpm preview`       | Preview the production build locally        |
| `pnpm build:preview` | Build then immediately preview              |
| `pnpm lint`          | Run ESLint                                  |
| `pnpm format`        | Format all files with Prettier              |
| `pnpm format:check`  | Check formatting without writing            |
| `pnpm format:lint`   | Format + lint in one step                   |
| `pnpm test`          | Run tests once                              |
| `pnpm test:watch`    | Run tests in watch mode                     |

## Adding shadcn/ui Components

Components are copied directly into your project (not installed as a package), so you own and can customize them freely.

```bash
# Example: add the Button component
pnpm dlx shadcn@latest add button
```

Components land in `src/shared/components/ui/`. Browse the full catalog at [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).

**shadcn/ui config** (`components.json`):

- Style: `new-york`
- Base color: `neutral`
- Icons: `lucide`
- CSS variables: enabled

## Project Structure

```
src/
├── bug-report/             # Bug report form feature
│   ├── components/
│   └── schemas/
├── expense-tracker/        # Expense tracker form feature
│   ├── components/
│   ├── schemas/
│   └── types/
├── register/               # Registration form feature
│   ├── components/
│   └── schemas/
├── shared/                 # Cross-feature shared code
│   ├── components/
│   │   └── ui/             # shadcn/ui + custom primitives
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   │   └── utils.ts        # cn() helper (clsx + tailwind-merge)
│   ├── providers/
│   ├── tests/
│   ├── types/
│   └── utilities/
├── components/
│   └── ui/                 # shadcn/ui auto-generated components
├── app.tsx
├── main.tsx
└── index.css               # Tailwind directives & CSS variables
```

## Path Aliases

Configured in `vite.config.ts` and `tsconfig.app.json`:

| Alias          | Resolves to       |
| -------------- | ----------------- |
| `@/`           | `src/`            |
| `@/components` | `src/components/` |
| `@/features/*` | `src/features/`   |
| `@/shared/*`   | `src/shared/`     |
| `@/lib/*`      | `src/lib/`        |

## Code Style

- **Prettier**: single quotes, no semicolons, 2-space indent, trailing commas, Tailwind class auto-sort
- **ESLint**: strict TypeScript checks, React hooks rules, accessibility (jsx-a11y), react-dom and react-x rules
- Unused variables prefixed with `_` are allowed (e.g. `_unusedParam`)
