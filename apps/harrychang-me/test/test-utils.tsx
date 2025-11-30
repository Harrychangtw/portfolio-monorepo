import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { LanguageProvider } from '@portfolio/lib/contexts//language-context'

// Custom render function that includes common providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <LanguageProvider>{children}</LanguageProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
