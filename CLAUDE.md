# Claude Code Guidelines

## Architecture

**Always use factory functions, never classes** for components:

```typescript
export default function MyComponent(
  pubsub: PubSub,
  dependency: SomeType
): MyComponentInterface {
  let state = initialState;

  function privateHelper() { /* ... */ }

  return { init, cleanup };
}
```

### Component Lifecycle

All components must implement `init()` and `cleanup()`. Components must be safe to call `cleanup()` multiple times.

### AbortController for DOM Event Listeners

Always use AbortController — never manual `removeEventListener`:

```typescript
let eventController: AbortController | null = null;

function addEvents(): void {
  if (eventController) {
    eventController.abort();
  }

  eventController = new AbortController();
  const { signal } = eventController;

  element.addEventListener("click", handler, { signal });
}

function cleanup(): void {
  if (eventController) {
    eventController.abort();
    eventController = null;
  }
}
```

### PubSub for Component Communication

Use PubSub for decoupled communication. Subscribe in `init()`, unsubscribe in `cleanup()`.

---

## State Management

Use the state machine for all state transitions — never mutate state directly. Subscribe to `STATE_CHANGED` via PubSub for reactive handling. All transitions must be defined in the machine; invalid transitions throw errors intentionally.

---

## TypeScript

- Default exports OK for components, named exports for utilities/constants
- Explicit types for public APIs

---

## Comments

Do not add comments for self-evident code. Only comment to explain **why**, not what:

```typescript
// BAD
// Check if the image is valid
const isValidImage = validateImageFile(file);

// GOOD - explains WHY
// Safari requires explicit clearRect before drawing to prevent visual artifacts
contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
```

---

## Error Handling

- Use custom error classes: `FileUploadError.validation(...)`, `CanvasError.contextCreation()`
- Use `logError` from `@/types/errors` — never `console.error` directly

---

## Testing

- Use Vitest. All new components/utilities must have `.test.ts` files
- Every component must test: init works, cleanup works, multiple cleanup calls safe, listeners removed on cleanup, subscriptions cleaned up

---

## Code Organization

```
src/
├── components/       # UI components
├── state/           # State management (machine, store, pubsub)
├── lib/             # Third-party or complex algorithms
├── utils/           # Pure utility functions
├── config/          # Configuration constants
├── types/           # TypeScript types and error classes
└── main.ts          # Application factory
```

---

## Performance

Always `clearRect` before `drawImage` on canvas — Safari requires this to prevent visual artifacts.

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`
