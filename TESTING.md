# Testing Guidelines for 10x Cards

This project uses both unit testing (Vitest) and end-to-end testing (Playwright) to ensure code quality and functionality.

## Unit Testing with Vitest

Unit tests are written using Vitest and React Testing Library. They focus on testing individual components, functions, and modules in isolation.

### Running Unit Tests

- **Run all tests once**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`
- **Run tests with UI**: `npm run test:ui`
- **Generate coverage report**: `npm run test:coverage`

### Unit Testing Guidelines

1. Use the `vi` object for test doubles:
   - `vi.fn()` for function mocks
   - `vi.spyOn()` to monitor existing functions
   - `vi.stubGlobal()` for global mocks

2. Place mock factory functions at the top level of your test file:
   ```typescript
   vi.mock('./path-to-module', () => ({
     myFunction: vi.fn().mockReturnValue('mocked value')
   }));
   ```

3. Use inline snapshots for readable assertions:
   ```typescript
   expect(component).toMatchInlineSnapshot();
   ```

4. Structure tests using the Arrange-Act-Assert pattern:
   ```typescript
   // Arrange
   const props = { /* ... */ };
   // Act
   render(<Component {...props} />);
   // Assert
   expect(screen.getByText('Expected Text')).toBeInTheDocument();
   ```

## End-to-End Testing with Playwright

E2E tests use Playwright to test the application from a user's perspective. They interact with the app just like a real user would.

### Running E2E Tests

- **Run all E2E tests**: `npm run e2e`
- **Run E2E tests with UI**: `npm run e2e:ui`
- **Generate test with codegen**: `npm run e2e:codegen`

### E2E Testing Guidelines

1. Use the Page Object Model for maintainable tests:
   - Create page objects in the `e2e/pages` directory
   - Abstract selectors and common actions into page classes

2. Use locators for resilient element selection:
   ```typescript
   page.getByRole('button', { name: 'Submit' });
   page.getByLabel('Email');
   ```

3. Implement visual comparison when appropriate:
   ```typescript
   await expect(page).toHaveScreenshot('expected-state.png');
   ```

4. Leverage trace viewer for debugging test failures:
   ```typescript
   test.use({ trace: 'on' });
   ```

## Test File Naming and Location

- Unit tests: Create test files adjacent to the code they test with a `.test.ts` or `.test.tsx` extension
- E2E tests: Place tests in the `e2e` directory with a `.spec.ts` extension
- Page Objects: Place in the `e2e/pages` directory

## CI/CD Integration

Tests automatically run in GitHub Actions:
- On push to main branch
- On pull requests to main branch

The workflow will:
1. Run unit tests and generate coverage reports
2. Run E2E tests and upload test artifacts 