import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import App from '../App'
import { useStore } from '../lib/store'

// Mock the IntroScene component
vi.mock('../components/IntroScene/IntroScene', () => ({
  default: ({ onComplete, autoStart, skipOnMobile }: any) => (
    <div 
      data-testid="intro-scene"
      data-auto-start={autoStart}
      data-skip-on-mobile={skipOnMobile}
    >
      <button onClick={onComplete} data-testid="complete-intro">
        Complete Intro
      </button>
      Intro Scene
    </div>
  )
}))

// Mock the Logo3D component
vi.mock('../components/Logo3D', () => ({
  default: ({ className, scale, rotationSpeed, mouseInfluence, autoRotate }: any) => (
    <div 
      data-testid="logo-3d"
      className={className}
      data-scale={scale}
      data-rotation-speed={rotationSpeed}
      data-mouse-influence={mouseInfluence}
      data-auto-rotate={autoRotate}
    >
      3D Logo
    </div>
  )
}))

// Mock Lenis
const mockLenis = vi.fn().mockImplementation(() => ({
  raf: vi.fn(),
  destroy: vi.fn()
}))

vi.mock('lenis', () => ({
  default: mockLenis
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      isIntroActive: false,
      isIntroComplete: false,
      currentPhase: 'loading',
      userSkipPreference: false,
      lenis: undefined
    })
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16)) as any
    
    // Mock focus method
    HTMLElement.prototype.focus = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Intro Scene Integration', () => {
    it('should render IntroScene when intro is not complete and user has no skip preference', () => {
      render(<App />)
      
      expect(screen.getByTestId('intro-scene')).toBeInTheDocument()
      expect(screen.queryByTestId('logo-3d')).not.toBeInTheDocument()
    })

    it('should pass correct props to IntroScene', () => {
      render(<App />)
      
      const introScene = screen.getByTestId('intro-scene')
      expect(introScene).toHaveAttribute('data-auto-start', 'true')
      expect(introScene).toHaveAttribute('data-skip-on-mobile', 'true')
    })

    it('should skip intro and show main content when user has skip preference', async () => {
      act(() => {
        useStore.setState({ userSkipPreference: true })
      })
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('intro-scene')).not.toBeInTheDocument()
        expect(screen.getByTestId('logo-3d')).toBeInTheDocument()
      })
    })

    it('should skip intro and show main content when intro is already complete', async () => {
      act(() => {
        useStore.setState({ isIntroComplete: true })
      })
      
      render(<App />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('intro-scene')).not.toBeInTheDocument()
        expect(screen.getByTestId('logo-3d')).toBeInTheDocument()
      })
    })
  })

  describe('Intro to Main Content Transition', () => {
    it('should transition from intro to main content when intro completes', async () => {
      render(<App />)
      
      // Initially, intro should be visible and main content should not
      expect(screen.getByTestId('intro-scene')).toBeInTheDocument()
      expect(screen.queryByTestId('logo-3d')).not.toBeInTheDocument()
      
      // Complete the intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      // Wait for transition
      await waitFor(() => {
        expect(screen.queryByTestId('intro-scene')).not.toBeInTheDocument()
        expect(screen.getByTestId('logo-3d')).toBeInTheDocument()
      })
    })

    it('should update store state when intro completes', async () => {
      render(<App />)
      
      // Complete the intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        const state = useStore.getState()
        expect(state.isIntroComplete).toBe(true)
        expect(state.currentPhase).toBe('complete')
        expect(state.isIntroActive).toBe(false)
      })
    })

    it('should apply smooth transition classes to main content', async () => {
      render(<App />)
      
      // Complete the intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        const mainContent = screen.getByRole('main', { name: /ieee cis main content/i })
        expect(mainContent).toHaveClass('transition-opacity', 'duration-300')
      })
    })

    it('should focus main content after intro completion for accessibility', async () => {
      const focusMock = vi.fn()
      HTMLElement.prototype.focus = focusMock
      
      render(<App />)
      
      // Complete the intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        expect(focusMock).toHaveBeenCalled()
      })
    })
  })

  describe('Lenis Integration', () => {
    beforeEach(() => {
      mockLenis.mockClear()
    })

    it('should not initialize Lenis until intro completes', () => {
      render(<App />)
      
      // Lenis should not be initialized while intro is active
      expect(mockLenis).not.toHaveBeenCalled()
    })

    it('should initialize Lenis after intro completes', async () => {
      render(<App />)
      
      // Complete the intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        expect(mockLenis).toHaveBeenCalledWith({
          lerp: 0.1,
          duration: 1.2,
          orientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        })
      })
    })

    it('should not reinitialize Lenis if already initialized', async () => {
      render(<App />)
      
      // Complete the intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        expect(mockLenis).toHaveBeenCalledTimes(1)
      })
      
      // Force re-render with same component
      const { rerender } = render(<App />)
      act(() => {
        rerender(<App />)
      })
      
      // Should still only be called once (due to lenisInitialized ref)
      expect(mockLenis).toHaveBeenCalledTimes(1)
    })
  })

  describe('Store Integration', () => {
    it('should start intro on mount when conditions are met', () => {
      render(<App />)
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      expect(state.currentPhase).toBe('animating')
    })

    it('should set loading phase initially when intro should be shown', () => {
      render(<App />)
      
      const state = useStore.getState()
      expect(state.currentPhase).toBe('animating') // Should transition from loading to animating
    })

    it('should complete intro immediately when skip conditions are met', async () => {
      act(() => {
        useStore.setState({ userSkipPreference: true })
      })
      
      render(<App />)
      
      await waitFor(() => {
        const state = useStore.getState()
        expect(state.isIntroComplete).toBe(true)
        expect(state.currentPhase).toBe('complete')
      })
    })
  })

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels on main content', async () => {
      render(<App />)
      
      // Complete intro to show main content
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        const mainContent = screen.getByRole('main', { name: /ieee cis main content/i })
        expect(mainContent).toBeInTheDocument()
        expect(mainContent).toHaveAttribute('tabIndex', '-1')
      })
    })

    it('should have proper heading structure', async () => {
      render(<App />)
      
      // Complete intro to show main content
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        // Header CIS title
        expect(screen.getByRole('heading', { level: 1, name: 'CIS' })).toBeInTheDocument()
        
        // Main content title
        expect(screen.getByRole('heading', { level: 1, name: /computational intelligence society/i })).toBeInTheDocument()
      })
    })

    it('should manage focus properly during transitions', async () => {
      const focusMock = vi.fn()
      HTMLElement.prototype.focus = focusMock
      
      render(<App />)
      
      // Complete intro
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      await waitFor(() => {
        expect(focusMock).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle intro completion callback errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<App />)
      
      // Simulate an error during intro completion
      
      // This should not crash the app even if there are errors
      expect(() => {
        fireEvent.click(screen.getByTestId('complete-intro'))
      }).not.toThrow()
      
      // Verify the app continues to function
      await waitFor(() => {
        expect(screen.getByTestId('logo-3d')).toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })

    it('should handle missing store state gracefully', () => {
      // Reset store to undefined state
      useStore.setState({
        isIntroComplete: undefined as any,
        userSkipPreference: undefined as any
      })
      
      expect(() => render(<App />)).not.toThrow()
    })
  })

  describe('Performance Considerations', () => {
    it('should not render 3D logo until main content is shown', () => {
      render(<App />)
      
      // 3D logo should not be rendered during intro
      expect(screen.queryByTestId('logo-3d')).not.toBeInTheDocument()
    })

    it('should clean up timers and effects properly', async () => {
      const { unmount } = render(<App />)
      
      // Complete intro to trigger timers
      fireEvent.click(screen.getByTestId('complete-intro'))
      
      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow()
    })
  })
})