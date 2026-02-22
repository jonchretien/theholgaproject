# TypeScript & Error Handling

## Exports

- Default exports for components
- Named exports for utilities/constants
- Explicit types for public APIs

## Error Handling

Use custom error classes:

```typescript
FileUploadError.validation(...)
CanvasError.contextCreation()
```

Use `logError` from `@/types/errors` — never `console.error` directly.
