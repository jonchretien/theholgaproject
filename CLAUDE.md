# Claude Code Guidelines

This document defines coding standards, architectural patterns, and review criteria for the Holga Project. These guidelines help maintain code quality and consistency across the codebase.

## Table of Contents

- [Architecture Patterns](#architecture-patterns)
- [TypeScript Standards](#typescript-standards)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [Testing Standards](#testing-standards)
- [Error Handling](#error-handling)
- [Code Organization](#code-organization)
- [Commit Conventions](#commit-conventions)
- [Performance](#performance)
- [Security](#security)

---

## Architecture Patterns

### Factory Pattern with Dependency Injection

**Always use factory functions, never classes** for components:

```typescript
// ✅ GOOD - Factory function with dependency injection
export default function MyComponent(
  pubsub: PubSub,
  dependency: SomeType
): MyComponentInterface {
  // Private state
  let state = initialState;

  // Private functions
  function privateHelper() { /* ... */ }

  // Public interface
  return {
    init,
    cleanup,
  };
}

// ❌ BAD - Class-based component
export class MyComponent {
  constructor() { /* ... */ }
}
```

### Component Lifecycle

All components **must** implement this lifecycle:

```typescript
export interface ComponentInterface {
  init: () => void;      // Initialize resources
  cleanup: () => void;   // Clean up resources
}
```

**Critical Rules:**
1. `init()` sets up event listeners and subscriptions
2. `cleanup()` removes all listeners and subscriptions
3. Components must be safe to call `cleanup()` multiple times
4. Use AbortController for DOM event listener cleanup

### Event Listener Cleanup with AbortController

**Always use AbortController** for DOM event listeners:

```typescript
// ✅ GOOD - AbortController pattern
let eventController: AbortController | null = null;

function addEvents(): void {
  // Abort existing listeners if called multiple times
  if (eventController) {
    eventController.abort();
  }

  eventController = new AbortController();
  const { signal } = eventController;

  element.addEventListener("click", handler, { signal });
  element.addEventListener("keydown", handler, { signal });
}

function cleanup(): void {
  if (eventController) {
    eventController.abort();
    eventController = null;
  }
}

// ❌ BAD - Manual removeEventListener
function addEvents(): void {
  element.addEventListener("click", handler);
}

function cleanup(): void {
  element.removeEventListener("click", handler); // Error-prone
}
```

### PubSub for Component Communication

Use PubSub for decoupled component communication:

```typescript
// ✅ GOOD - PubSub pattern
function init(): void {
  pubsub.subscribe(EVENT_NAME, handleEvent);
}

function cleanup(): void {
  pubsub.unsubscribe(EVENT_NAME, handleEvent);
}

// ❌ BAD - Direct component coupling
function init(): void {
  otherComponent.onEvent(handleEvent); // Creates tight coupling
}
```

---

## TypeScript Standards

### Strict Mode

TypeScript strict mode is **required**. All code must pass strict type checking:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Type Annotations

**Explicit typing is preferred** over type inference for public APIs:

```typescript
// ✅ GOOD - Explicit types
export function processImage(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): void {
  // Implementation
}

// ❌ BAD - Inferred types for public API
export function processImage(canvas, context) {
  // TypeScript infers 'any'
}
```

### Import Type

**Use `import type`** for type-only imports:

```typescript
// ✅ GOOD - Type-only import
import type { StateStore } from "@/state/store";
import type { HeadingComponent } from "./heading";

// ❌ BAD - Value import for types
import { StateStore } from "@/state/store";
```

### No Default Exports for Utilities

**Use named exports** for utilities and constants:

```typescript
// ✅ GOOD - Named exports
export const CANVAS_SIZE = 820;
export function validateImage(file: File): boolean { /* ... */ }

// ❌ BAD - Default export for utility
export default {
  CANVAS_SIZE: 820,
  validateImage: (file: File) => { /* ... */ }
};
```

**Exception:** Default exports are OK for components:

```typescript
// ✅ OK - Component default export
export default function PhotoCanvas(...): PhotoCanvasComponent {
  // ...
}
```

---

## Component Guidelines

### Single Responsibility Principle

Each component should have **one clear responsibility**:

- `PhotoCanvas` - Manages canvas element and image operations
- `Buttons` - Manages button interactions and state
- `Heading` - Updates heading text based on application state

### Pure Functions

Prefer pure functions with no side effects:

```typescript
// ✅ GOOD - Pure function
export function calculateAspectRatio(
  width: number,
  height: number
): number {
  return width / height;
}

// ❌ BAD - Side effects in function
let globalRatio = 0;
export function calculateAspectRatio(width: number, height: number): void {
  globalRatio = width / height; // Mutates global state
}
```

### Avoid Over-Engineering

**Keep it simple.** Only add complexity when necessary:

```typescript
// ✅ GOOD - Simple, direct
function disableButton(button: HTMLButtonElement): void {
  button.setAttribute("disabled", "true");
}

// ❌ BAD - Unnecessary abstraction
class ButtonStateManager {
  private states: Map<HTMLButtonElement, ButtonState>;
  constructor() { /* complex setup */ }
  setState(button: HTMLButtonElement, state: ButtonState) { /* ... */ }
}
```

**Rules:**
- Don't add features not requested
- Don't refactor surrounding code unless necessary
- Don't add error handling for impossible scenarios
- Three similar lines is better than a premature abstraction

### No Comments for Self-Evident Code

Only add comments where logic isn't obvious:

```typescript
// ✅ GOOD - Clear code, no comment needed
const isValidImage = validateImageFile(file);

// ❌ BAD - Redundant comment
// Check if the image is valid
const isValidImage = validateImageFile(file);

// ✅ GOOD - Comment explains WHY
// Safari requires explicit clearRect before drawing to prevent visual artifacts
contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
```

---

## State Management

### Finite State Machine

Use the state machine for **all application state transitions**:

```typescript
// ✅ GOOD - State machine transition
store.setState(currentState, ACTION);

// ❌ BAD - Direct state mutation
currentState = "photo"; // Bypasses state machine validation
```

### State Machine Rules

1. **All transitions must be defined** in the state machine
2. **Invalid transitions throw errors** - this is intentional
3. **State is immutable** - always transition through actions
4. **No local state that duplicates store state**

```typescript
// ✅ GOOD - Use store state
const currentState = store.getState();
if (currentState === "error") {
  // Handle error
}

// ❌ BAD - Local state duplication
let currentState = "idle"; // Out of sync with store
```

### PubSub State Changes

Subscribe to `STATE_CHANGED` for reactive state handling:

```typescript
// ✅ GOOD - Subscribe to state changes
pubsub.subscribe<StateChangeEvent>(STATE_CHANGED, ({ currentState }) => {
  if (currentState === "error") {
    removeErrorMessage();
  }
});

// ❌ BAD - Polling or direct checks
setInterval(() => {
  if (store.getState() === "error") { /* ... */ }
}, 100);
```

---

## Testing Standards

### Test Coverage Requirements

- **All new components** must have corresponding `.test.ts` files
- **All new utilities** must have tests
- **Critical paths** must have integration tests
- Aim for **>80% code coverage**

### Test Structure

Use Vitest with this structure:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("ComponentName", () => {
  let mockDependency: DependencyType;

  beforeEach(() => {
    // Setup
    mockDependency = {
      method: vi.fn(),
    } as unknown as DependencyType;
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = "";
  });

  it("should do something specific", () => {
    // Arrange
    const component = Component(mockDependency);

    // Act
    component.init();

    // Assert
    expect(mockDependency.method).toHaveBeenCalled();
  });
});
```

### What to Test

**Focus on behavior, not implementation:**

```typescript
// ✅ GOOD - Tests behavior
it("should remove event listeners on cleanup", () => {
  const component = Component();
  component.init();
  component.cleanup();

  // Verify behavior: events don't fire after cleanup
  element.dispatchEvent(new Event("click"));
  expect(handler).not.toHaveBeenCalled();
});

// ❌ BAD - Tests implementation details
it("should call removeEventListener", () => {
  const spy = vi.spyOn(element, "removeEventListener");
  component.cleanup();
  expect(spy).toHaveBeenCalled(); // Too coupled to implementation
});
```

### Component Lifecycle Tests

Every component must test:

1. ✅ Initialization without errors
2. ✅ Cleanup without errors
3. ✅ Multiple cleanup calls are safe
4. ✅ Event listeners are removed on cleanup
5. ✅ Subscriptions are cleaned up

---

## Error Handling

### Custom Error Classes

Use **custom error classes** for specific error types:

```typescript
// ✅ GOOD - Custom error with context
throw FileUploadError.validation("File type not supported");
throw CanvasError.contextCreation();

// ❌ BAD - Generic error
throw new Error("File type not supported");
```

### Error Logging

Use the centralized `logError` function:

```typescript
// ✅ GOOD - Centralized logging
import { logError } from "@/types/errors";

try {
  // risky operation
} catch (error) {
  logError(error, "ComponentName:methodName");
}

// ❌ BAD - Console.error directly
try {
  // risky operation
} catch (error) {
  console.error(error); // Inconsistent, harder to track
}
```

### Validation at Boundaries

**Only validate at system boundaries:**

```typescript
// ✅ GOOD - Validate user input
function dropElement(event: DragEvent): void {
  const file = event.dataTransfer?.files[0];
  const result = validateImageFile(file);
  if (!result.valid) {
    // Handle invalid input
  }
}

// ❌ BAD - Validate internal data
function applyFilter(canvas: HTMLCanvasElement): void {
  if (!canvas) throw new Error("Canvas required");
  // This should never happen in internal code
}
```

---

## Code Organization

### Directory Structure

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

### File Naming

- Components: `component-name.ts`, `component-name.test.ts`
- Utilities: `utility-name.ts`, `utility-name.test.ts`
- Types: `types.ts`, `errors.ts`
- Tests: Always `.test.ts` suffix

### Import Order

Organize imports in this order:

```typescript
// 1. External dependencies
import { describe, it, expect } from "vitest";

// 2. Internal types
import type { StateStore } from "@/state/store";
import type { HeadingComponent } from "./heading";

// 3. Internal values
import { STATE_CHANGED } from "@/state/store";
import { APPLY_BW_FILTER } from "@/state/constants";
import PhotoCanvas from "./canvas";
```

---

## Commit Conventions

### Commit Message Format

Use these prefixes:

- `[feat]` - New feature
- `[fix]` - Bug fix
- `[refactor]` - Code refactoring (no behavior change)
- `[cleanup]` - Code cleanup (removing unused code, formatting)
- `[test]` - Adding or updating tests
- `[docs]` - Documentation updates

### Commit Message Structure

```
[prefix] Short description (50 chars or less)

Longer explanation of what changed and why. Wrap at 72 characters.
Include motivation for the change and contrast with previous behavior.

Changes:
- Specific change 1
- Specific change 2

Benefits:
- Benefit 1
- Benefit 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Examples

```
[refactor] Use AbortController for event listener cleanup

Replace manual removeEventListener calls with AbortController's
signal pattern in Canvas and Buttons components.

Changes:
- Canvas: Added AbortController to manage 5 event listeners
- Buttons: Added AbortController for dynamic listener management
- Tests: Created comprehensive test suites for both components

Benefits:
- Simpler cleanup: 5 removeEventListener calls → 1 abort() call
- Guards against listener duplication
- Maintains same public API
```

---

## Performance

### Canvas Operations

**Clear before drawing** to prevent visual artifacts in Safari:

```typescript
// ✅ GOOD - Explicit clear for Safari compatibility
contextObject.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
contextObject.drawImage(imageObject, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

// ❌ BAD - Assume browser handles clearing
contextObject.drawImage(imageObject, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
```

### Avoid Unnecessary Re-renders

Use AbortController to prevent duplicate event listeners:

```typescript
// ✅ GOOD - Prevents duplication
function addEvents(): void {
  if (eventController) {
    eventController.abort(); // Remove old listeners
  }
  eventController = new AbortController();
  // Add new listeners
}
```

---

## Security

### Validate User Input

**Always validate files at upload boundaries:**

```typescript
// ✅ GOOD - Validation before processing
const validationResult = validateImageFile(file);
if (!validationResult.valid) {
  logError(
    FileUploadError.validation(validationResult.error!),
    "PhotoCanvas"
  );
  return;
}
```

### Avoid XSS

**Never use `innerHTML` with user data:**

```typescript
// ✅ GOOD - Safe text content
element.textContent = userInput;

// ❌ BAD - XSS vulnerability
element.innerHTML = userInput;
```

---

## Review Criteria

When reviewing code (or when Claude reviews), check for:

### Architecture
- [ ] Uses factory pattern with dependency injection
- [ ] Components have `init()` and `cleanup()` methods
- [ ] AbortController used for DOM event listeners
- [ ] PubSub used for component communication
- [ ] State transitions go through state machine

### TypeScript
- [ ] Passes strict type checking
- [ ] Explicit types for public APIs
- [ ] `import type` for type-only imports
- [ ] No `any` types without justification

### Testing
- [ ] New components have test files
- [ ] Tests focus on behavior, not implementation
- [ ] Lifecycle tests included
- [ ] All tests pass

### Code Quality
- [ ] Single responsibility per component
- [ ] Pure functions preferred
- [ ] No over-engineering
- [ ] Comments only where necessary
- [ ] Follows existing patterns

### Error Handling
- [ ] Custom error classes used
- [ ] Centralized error logging
- [ ] Validation at boundaries only

### Commit
- [ ] Descriptive commit message with prefix
- [ ] Explains what and why
- [ ] Includes Claude co-author line

---

## Questions or Clarifications?

If something in this guide is unclear or conflicts with project needs:

1. Ask for clarification before implementing
2. Document the decision in this file
3. Update patterns consistently across the codebase

This is a living document - update it as patterns evolve!
