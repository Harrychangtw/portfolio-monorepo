# Testing Documentation

This directory contains the testing infrastructure for the portfolio site.

## Test Files

- **`setup.tsx`**: Global test configuration and mocks
  - Mocks Next.js router, Image component, and framer-motion
  - Sets up jsdom environment with localStorage and IntersectionObserver
  - Configures Testing Library cleanup

- **`test-utils.tsx`**: Custom render utilities
  - `renderWithProviders()`: Wraps components with LanguageProvider
  - Re-exports all Testing Library utilities

- **`mockData.ts`**: Mock data for tests
  - Sample projects, gallery items, and papers
  - Mock translation objects for i18n testing

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Open interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Organization

Tests are co-located with source files using the `.test.ts` or `.test.tsx` suffix:

```
lib/
  markdown.ts
  markdown.test.ts         # Unit tests for markdown utilities

contexts/
  LanguageContext.tsx
  LanguageContext.test.tsx # Component tests for i18n

app/
  api/
    api.test.ts            # Integration tests for API routes
```

## Writing Tests

### Unit Tests (Utilities/Functions)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { myFunction } from './myModule'

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })
})
```

### Component Tests

```typescript
import { render } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', async () => {
    const { getByTestId } = render(
      <LanguageProvider>
        <MyComponent />
      </LanguageProvider>
    )

    await vi.waitFor(() => {
      expect(getByTestId('my-element')).toBeInTheDocument()
    })
  })
})
```

### API Route Tests

```typescript
import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('GET /api/endpoint', () => {
  it('should return data', async () => {
    const request = new Request('http://localhost:3000/api/endpoint')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toBeDefined()
  })
})
```

## Common Patterns

### Testing with i18n

Always check `isLoading` before assertions to prevent FOUC:

```typescript
function TestComponent() {
  const { t, isLoading } = useLanguage()
  if (isLoading) return <div>Loading...</div>
  return <div data-testid="text">{t('key')}</div>
}
```

### Mocking File System

For tests that read markdown files:

```typescript
vi.mock('fs')
const mockFs = fs as any
mockFs.existsSync.mockReturnValue(true)
mockFs.readFileSync.mockReturnValue('markdown content')
```

### Testing Async Operations

Use `vi.waitFor` for async state updates:

```typescript
await vi.waitFor(() => {
  expect(getByTestId('element')).toHaveTextContent('loaded data')
}, { timeout: 3000 })
```

### Testing User Interactions

```typescript
import { act } from 'react'

const button = getByText('Click me')
await act(async () => {
  button.click()
})

await vi.waitFor(() => {
  expect(getByTestId('result')).toHaveTextContent('clicked')
})
```

## Mocked Modules

The following are automatically mocked in `setup.tsx`:

- `next/navigation` - Router hooks return mock functions
- `next/image` - Returns simple `<img>` element
- `framer-motion` - Returns static HTML elements (no animations)
- `localStorage` - In-memory implementation
- `IntersectionObserver` - No-op implementation
- `matchMedia` - Returns default values

## Best Practices

1. **Test behavior, not implementation**: Focus on what users see and do
2. **Use descriptive test names**: `should do X when Y happens`
3. **Arrange-Act-Assert pattern**: Setup, perform action, verify result
4. **One assertion per concept**: Multiple expects are fine if testing same thing
5. **Mock external dependencies**: File system, API calls, browser APIs
6. **Test error cases**: Don't just test the happy path
7. **Keep tests fast**: Mock expensive operations
8. **Use data-testid**: For reliable element selection

## Coverage Goals

Target coverage by module:
- **lib/**: 80%+ (core business logic)
- **components/**: 60%+ (UI components)
- **contexts/**: 90%+ (critical app state)
- **api/**: 70%+ (endpoint logic)

View coverage report after running:
```bash
npm run test:coverage
open coverage/index.html
```

## Debugging Tests

1. **Use test:ui**: Visual interface for debugging
   ```bash
   npm run test:ui
   ```

2. **Add console.logs**: They appear in terminal output

3. **Use `.only`**: Run single test
   ```typescript
   it.only('should test this one', () => {
     // ...
   })
   ```

4. **Check actual HTML**: Use `debug()` from Testing Library
   ```typescript
   const { debug } = render(<Component />)
   debug() // Prints current DOM to console
   ```

## CI/CD Integration

Tests run automatically in CI pipeline before deployment:
```yaml
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Questions?

Refer to:
- [Vitest docs](https://vitest.dev/)
- [Testing Library docs](https://testing-library.com/react)
- `.github/copilot-instructions.md` for project-specific patterns
