# The Holga Project

Browser-based Holga-like photo filter app (Vite + TypeScript).

## Build

- `npm run build` — type-check + test + vite build
- `npm run type-check` — `tsc --noEmit`

## Key Conventions

- **Factory functions only** — never classes for components
- **State machine** for all state transitions — never mutate state directly
- **`logError`** from `@/types/errors` — never `console.error`

## Docs

- [Architecture](docs/claude/architecture.md)
- [TypeScript & Error Handling](docs/claude/typescript.md)
- [Testing](docs/claude/testing.md)
- [Git](docs/claude/git.md)
