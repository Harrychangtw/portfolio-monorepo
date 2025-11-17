import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '@portfolio/lib/contexts/LanguageContext'
import { act } from 'react'

// Test component that uses the language context
function TestComponent() {
  const { t, language, setLanguage, isLoading } = useLanguage()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="language">{language}</div>
      <div data-testid="title">{t('title', 'common')}</div>
      <button onClick={() => setLanguage('zh-TW')}>Switch to Chinese</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  )
}

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    
    // Mock fetch for translation files
    global.fetch = vi.fn((url: string) => {
      const urlStr = url.toString()
      
      if (urlStr.includes('/locales/en/common.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ title: 'Portfolio' }),
        } as Response)
      }
      
      if (urlStr.includes('/locales/zh-TW/common.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ title: '作品集' }),
        } as Response)
      }
      
      if (urlStr.includes('/locales/en/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      }
      
      if (urlStr.includes('/locales/zh-TW/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response)
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      } as Response)
    }) as any
  })

  it('should initialize with default English language', async () => {
    let result: ReturnType<typeof render>
    
    await act(async () => {
      result = render(<LanguageProvider><TestComponent /></LanguageProvider>)
      // Wait a tick for effects to settle
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(result!.getByTestId('language')).toHaveTextContent('en')
    })
  })

  it('should load and display translations', async () => {
    let result: ReturnType<typeof render>
    
    await act(async () => {
      result = render(<LanguageProvider><TestComponent /></LanguageProvider>)
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(result!.getByTestId('title')).toHaveTextContent('Portfolio')
    })
  })

  it('should switch languages when setLanguage is called', async () => {
    let result: ReturnType<typeof render>
    
    await act(async () => {
      result = render(<LanguageProvider><TestComponent /></LanguageProvider>)
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Wait for initial load
    await vi.waitFor(() => {
      expect(result!.getByTestId('title')).toHaveTextContent('Portfolio')
    })

    // Switch to Chinese
    const switchButton = result!.getByText('Switch to Chinese')
    await act(async () => {
      switchButton.click()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(result!.getByTestId('language')).toHaveTextContent('zh-TW')
      expect(result!.getByTestId('title')).toHaveTextContent('作品集')
    })
  })

  it('should save language preference to localStorage', async () => {
    let result: ReturnType<typeof render>
    
    await act(async () => {
      result = render(<LanguageProvider><TestComponent /></LanguageProvider>)
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(result!.getByTestId('title')).toHaveTextContent('Portfolio')
    })

    const switchButton = result!.getByText('Switch to Chinese')
    await act(async () => {
      switchButton.click()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(localStorage.getItem('language')).toBe('zh-TW')
    })
  })

  it('should show loading state initially', async () => {
    let result: ReturnType<typeof render>
    
    // Render without act to catch the immediate state
    result = render(<LanguageProvider><TestComponent /></LanguageProvider>)
    
    // Immediately check - should be hidden before effects run
    const wrapper = result!.container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ visibility: 'hidden' })
    
    // Wait for effects to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    // After effects, should be visible
    await vi.waitFor(() => {
      expect(wrapper).toHaveStyle({ visibility: 'visible' })
    })
  })

  it('should handle nested translation keys', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.toString().includes('/locales/en/common.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            nav: {
              home: 'Home',
              projects: 'Projects',
            },
          }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    }) as any

    function NestedTestComponent() {
      const { t, isLoading } = useLanguage()
      if (isLoading) return <div>Loading...</div>
      return <div data-testid="nav-home">{t('nav.home', 'common')}</div>
    }

    let result: ReturnType<typeof render>
    
    await act(async () => {
      result = render(<LanguageProvider><NestedTestComponent /></LanguageProvider>)
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(result!.getByTestId('nav-home')).toHaveTextContent('Home')
    })
  })

  it('should return empty string for missing translations', async () => {
    function MissingKeyComponent() {
      const { t, isLoading } = useLanguage()
      if (isLoading) return <div>Loading...</div>
      return <div data-testid="missing">{t('nonexistent.key', 'common')}</div>
    }

    let result: ReturnType<typeof render>
    
    await act(async () => {
      result = render(<LanguageProvider><MissingKeyComponent /></LanguageProvider>)
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await vi.waitFor(() => {
      expect(result!.getByTestId('missing')).toHaveTextContent('')
    })
  })
})
