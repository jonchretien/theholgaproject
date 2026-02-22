# Testing

Use Vitest. All new components/utilities must have `.test.ts` files.

Every component must test:

- `init()` works
- `cleanup()` works
- Multiple `cleanup()` calls are safe
- Listeners removed on cleanup
- Subscriptions cleaned up on cleanup
