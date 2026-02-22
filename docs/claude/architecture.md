# Architecture

## Factory Functions

Always use factory functions, never classes:

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

## Component Lifecycle

All components must implement `init()` and `cleanup()`. `cleanup()` must be safe to call multiple times.

## AbortController for DOM Events

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

## PubSub

Use PubSub for decoupled component communication. Subscribe in `init()`, unsubscribe in `cleanup()`.

## State Management

Use the state machine for all transitions — never mutate state directly. Subscribe to `STATE_CHANGED` via PubSub for reactive handling. Invalid transitions throw intentionally.

## Performance

Always `clearRect` before `drawImage` on canvas:

```typescript
// Safari requires explicit clearRect before drawing to prevent visual artifacts
contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
```

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
