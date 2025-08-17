import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ScrollNavBar } from '../ScrollNavBar'
import { useStore } from '../../../../lib/store'

// Mock the store
vi.mock('../../../../lib/store')
const mockUseStore = vi.mocked(useStore)

// Mock the scroll progress hook to return real-like values
vi.mock('../../hooks/useScrollProgress', () => ({
  useScrollProgress: () => ({
    raw: 0.2,
    eased: 0.15,
    velocity: 0.5,
    direction: 'down' as const,
    zones: {
      navAppear: { progress: 0.8, isActive: true },
      logoTransition: { progress: 0.6, isActive: true }
    }
  })
}))

// Mock Lenis
const mockLenis = {
  scrollTo: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
}

describe('ScrollNavBar Integration', () => {
  const mockSetShowNavigation = vi.fn()
  const mockSetActiveSection = vi.fn()

  const defaultStoreState = {
    lenis: mockLenis,
    showNavigation: false,
    activeSection: 'hero' as const,
    setShowNavigation: mockSetShowNavigation,
    setActiveSection: mockSetActiveSection
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseStore.mockReturnValue(defaultStoreState as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should integrate properly with scroll system and show navigation', () => {
    render(<ScrollNavBar />)
    
    const nav = screen.getByRole('navigation')
    
    // Should be visible due to scroll progress
    expect(nav).toHaveStyle({ opacity: '0.8' })
    expect(nav).toHaveStyle({ pointerEvents: 'auto' })
  })

  it('should handle complete user interaction flow', async () => {
    // Mock DOM element for scroll target
    const mockAboutSection = document.createElement('div')
    mockAboutSection.id = 'about-section'
    vi.spyOn(document, 'getElementById').mockReturnValue(mockAboutSection)

    render(<ScrollNavBar />)
    
    // User clicks About Us button
    const aboutButton = screen.getByRole('button', { name: /navigate to about us section/i })
    fireEvent.click(aboutButton)

    // Should update active section and scroll
    await waitFor(() => {
      expect(mockSetActiveSection).toHaveBeenCalledWith('about')
      expect(mockLenis.scrollTo).toHaveBeenCalledWith(mockAboutSection, {
        duration: 1.2,
        easing: expect.any(Function)
      })
    })
  })

  it('should handle logo click to scroll to top', async () => {
    render(<ScrollNavBar />)
    
    const logoSlot = screen.getByRole('button', { name: /scroll to top/i })
    fireEvent.click(logoSlot)

    await waitFor(() => {
      expect(mockSetActiveSection).toHaveBeenCalledWith('hero')
      expect(mockLenis.scrollTo).toHaveBeenCalledWith(0, {
        duration: 1.2,
        easing: expect.any(Function)
      })
    })
  })

  it('should update store navigation state based on scroll progress', () => {
    render(<ScrollNavBar />)
    
    // Should call setShowNavigation with true since navAppear progress > 0.1
    expect(mockSetShowNavigation).toHaveBeenCalledWith(true)
  })

  it('should handle responsive behavior', () => {
    render(<ScrollNavBar />)
    
    const nav = screen.getByRole('navigation')
    const navContainer = nav.querySelector('div')
    
    // Should have responsive classes
    expect(navContainer).toHaveClass('_navContainer_824ad3')
    
    // Logo slot should have responsive sizing
    const logoSlot = screen.getByTestId('nav-logo-slot')
    expect(logoSlot).toHaveClass('w-12', 'h-12', 'md:w-10', 'md:h-10')
  })

  it('should maintain accessibility during interactions', async () => {
    render(<ScrollNavBar />)
    
    // Check ARIA labels are present
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
    
    // Check keyboard navigation works
    const logoSlot = screen.getByRole('button', { name: /scroll to top/i })
    logoSlot.focus()
    
    fireEvent.keyDown(logoSlot, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockSetActiveSection).toHaveBeenCalledWith('hero')
    })
  })
})