import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ScrollNavBar } from '../ScrollNavBar'
import { useStore } from '../../../../lib/store'
import { useScrollProgress } from '../../hooks/useScrollProgress'

// Mock the store
vi.mock('../../../../lib/store')
const mockUseStore = vi.mocked(useStore)

// Mock the scroll progress hook
vi.mock('../../hooks/useScrollProgress')
const mockUseScrollProgress = vi.mocked(useScrollProgress)

// Mock Lenis
const mockLenis = {
  scrollTo: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
}

describe('ScrollNavBar', () => {
  const mockSetShowNavigation = vi.fn()
  const mockSetActiveSection = vi.fn()

  const defaultStoreState = {
    lenis: mockLenis,
    showNavigation: false,
    activeSection: 'hero' as const,
    setShowNavigation: mockSetShowNavigation,
    setActiveSection: mockSetActiveSection
  }

  const defaultScrollProgress = {
    raw: 0,
    eased: 0,
    velocity: 0,
    direction: 'down' as const,
    zones: {
      navAppear: { progress: 0, isActive: false }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseStore.mockReturnValue(defaultStoreState as any)
    mockUseScrollProgress.mockReturnValue(defaultScrollProgress)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Visibility and Animation', () => {
    it('should be hidden when scroll progress is 0', () => {
      render(<ScrollNavBar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ opacity: '0' })
      expect(nav).toHaveStyle({ pointerEvents: 'none' })
    })

    it('should become visible when navAppear zone is active', () => {
      mockUseScrollProgress.mockReturnValue({
        ...defaultScrollProgress,
        zones: {
          navAppear: { progress: 0.5, isActive: true }
        }
      })

      render(<ScrollNavBar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ opacity: '0.5' })
      expect(nav).toHaveStyle({ pointerEvents: 'auto' })
    })

    it('should be fully visible when showNavigation is true', () => {
      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        showNavigation: true
      } as any)

      render(<ScrollNavBar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveStyle({ opacity: '1' })
      expect(nav).toHaveStyle({ pointerEvents: 'auto' })
    })

    it('should apply transform animation based on opacity', () => {
      mockUseScrollProgress.mockReturnValue({
        ...defaultScrollProgress,
        zones: {
          navAppear: { progress: 0.3, isActive: true }
        }
      })

      render(<ScrollNavBar />)
      
      const nav = screen.getByRole('navigation')
      // Transform should be translateY(-14px) when opacity is 0.3
      expect(nav).toHaveStyle({ transform: 'translateY(-14px)' })
    })
  })

  describe('Navigation Buttons', () => {
    beforeEach(() => {
      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        showNavigation: true
      } as any)
    })

    it('should render Events and About Us buttons', () => {
      render(<ScrollNavBar />)
      
      expect(screen.getByRole('button', { name: /navigate to events section/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /navigate to about us section/i })).toBeInTheDocument()
    })

    it('should highlight active section button', () => {
      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        showNavigation: true,
        activeSection: 'about'
      } as any)

      render(<ScrollNavBar />)
      
      const aboutButton = screen.getByRole('button', { name: /navigate to about us section/i })
      // Check for CSS module class name pattern
      expect(aboutButton.className).toMatch(/active/)
    })

    it('should call scrollToSection when Events button is clicked', async () => {
      // Mock getElementById to return a mock element
      const mockElement = document.createElement('div')
      vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

      render(<ScrollNavBar />)
      
      const eventsButton = screen.getByRole('button', { name: /navigate to events section/i })
      fireEvent.click(eventsButton)

      await waitFor(() => {
        expect(mockSetActiveSection).toHaveBeenCalledWith('events')
        expect(mockLenis.scrollTo).toHaveBeenCalledWith(mockElement, {
          duration: 1.2,
          easing: expect.any(Function)
        })
      })
    })

    it('should call scrollToSection when About Us button is clicked', async () => {
      const mockElement = document.createElement('div')
      vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

      render(<ScrollNavBar />)
      
      const aboutButton = screen.getByRole('button', { name: /navigate to about us section/i })
      fireEvent.click(aboutButton)

      await waitFor(() => {
        expect(mockSetActiveSection).toHaveBeenCalledWith('about')
        expect(mockLenis.scrollTo).toHaveBeenCalledWith(mockElement, {
          duration: 1.2,
          easing: expect.any(Function)
        })
      })
    })
  })

  describe('Logo Interaction', () => {
    beforeEach(() => {
      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        showNavigation: true
      } as any)
    })

    it('should scroll to top when logo is clicked', async () => {
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

    it('should handle keyboard navigation for logo', async () => {
      render(<ScrollNavBar />)
      
      const logoSlot = screen.getByRole('button', { name: /scroll to top/i })
      
      // Test Enter key
      fireEvent.keyDown(logoSlot, { key: 'Enter' })
      await waitFor(() => {
        expect(mockSetActiveSection).toHaveBeenCalledWith('hero')
        expect(mockLenis.scrollTo).toHaveBeenCalledWith(0, expect.any(Object))
      })

      vi.clearAllMocks()

      // Test Space key
      fireEvent.keyDown(logoSlot, { key: ' ' })
      await waitFor(() => {
        expect(mockSetActiveSection).toHaveBeenCalledWith('hero')
        expect(mockLenis.scrollTo).toHaveBeenCalledWith(0, expect.any(Object))
      })
    })

    it('should not trigger scroll on other keys', () => {
      render(<ScrollNavBar />)
      
      const logoSlot = screen.getByRole('button', { name: /scroll to top/i })
      fireEvent.keyDown(logoSlot, { key: 'Tab' })

      expect(mockLenis.scrollTo).not.toHaveBeenCalled()
    })
  })

  describe('Store Integration', () => {
    it('should update showNavigation when navAppear zone progress changes', () => {
      const { rerender } = render(<ScrollNavBar />)

      // Initially hidden
      expect(mockSetShowNavigation).not.toHaveBeenCalled()

      // Update to show navigation
      mockUseScrollProgress.mockReturnValue({
        ...defaultScrollProgress,
        zones: {
          navAppear: { progress: 0.2, isActive: true }
        }
      })

      rerender(<ScrollNavBar />)

      expect(mockSetShowNavigation).toHaveBeenCalledWith(true)
    })

    it('should handle missing Lenis instance gracefully', async () => {
      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        lenis: undefined,
        showNavigation: true
      } as any)

      render(<ScrollNavBar />)
      
      const aboutButton = screen.getByRole('button', { name: /navigate to about us section/i })
      fireEvent.click(aboutButton)

      // Should not throw error and should still update active section
      await waitFor(() => {
        expect(mockSetActiveSection).toHaveBeenCalledWith('about')
      })
    })

    it('should handle missing target element gracefully', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null)

      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        showNavigation: true
      } as any)

      render(<ScrollNavBar />)
      
      const aboutButton = screen.getByRole('button', { name: /navigate to about us section/i })
      fireEvent.click(aboutButton)

      // Should not throw error
      expect(mockSetActiveSection).toHaveBeenCalledWith('about')
      expect(mockLenis.scrollTo).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseStore.mockReturnValue({
        ...defaultStoreState,
        showNavigation: true
      } as any)
    })

    it('should have proper ARIA labels', () => {
      render(<ScrollNavBar />)
      
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /navigate to events section/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /navigate to about us section/i })).toBeInTheDocument()
    })

    it('should have proper tabindex for logo slot', () => {
      render(<ScrollNavBar />)
      
      const logoSlot = screen.getByRole('button', { name: /scroll to top/i })
      expect(logoSlot).toHaveAttribute('tabIndex', '0')
    })

    it('should have aria-hidden for logo slot content', () => {
      render(<ScrollNavBar />)
      
      const logoSlotContent = screen.getByTestId('nav-logo-slot')
      expect(logoSlotContent).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(<ScrollNavBar className="custom-nav-class" />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('custom-nav-class')
    })
  })
})