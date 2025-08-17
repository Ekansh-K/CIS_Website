import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store'

describe('Store - Scroll State Management', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      scrollProgress: 0,
      isScrolling: false,
      showNavigation: false,
      activeSection: 'hero',
      logoTransition: {
        position: 'center',
        scale: 3.5,
        progress: 0
      },
      aboutState: {
        pointsRevealed: 0,
        showContent: false,
        activePoint: -1
      }
    })
  })

  it('should initialize with default scroll state', () => {
    const state = useStore.getState()

    expect(state.scrollProgress).toBe(0)
    expect(state.isScrolling).toBe(false)
    expect(state.showNavigation).toBe(false)
    expect(state.activeSection).toBe('hero')
    expect(state.logoTransition).toEqual({
      position: 'center',
      scale: 3.5,
      progress: 0
    })
    expect(state.aboutState).toEqual({
      pointsRevealed: 0,
      showContent: false,
      activePoint: -1
    })
  })

  it('should update scroll progress', () => {
    const { updateScrollProgress } = useStore.getState()

    updateScrollProgress(0.5)

    expect(useStore.getState().scrollProgress).toBe(0.5)
  })

  it('should update scrolling state', () => {
    const { setIsScrolling } = useStore.getState()

    setIsScrolling(true)

    expect(useStore.getState().isScrolling).toBe(true)

    setIsScrolling(false)

    expect(useStore.getState().isScrolling).toBe(false)
  })

  it('should update navigation visibility', () => {
    const { setShowNavigation } = useStore.getState()

    setShowNavigation(true)

    expect(useStore.getState().showNavigation).toBe(true)

    setShowNavigation(false)

    expect(useStore.getState().showNavigation).toBe(false)
  })

  it('should update active section', () => {
    const { setActiveSection } = useStore.getState()

    setActiveSection('about')

    expect(useStore.getState().activeSection).toBe('about')

    setActiveSection('events')

    expect(useStore.getState().activeSection).toBe('events')

    setActiveSection('hero')

    expect(useStore.getState().activeSection).toBe('hero')
  })

  it('should update logo transition state partially', () => {
    const { setLogoTransition } = useStore.getState()

    setLogoTransition({ position: 'transitioning' })

    const state = useStore.getState()
    expect(state.logoTransition.position).toBe('transitioning')
    expect(state.logoTransition.scale).toBe(3.5) // Should remain unchanged
    expect(state.logoTransition.progress).toBe(0) // Should remain unchanged
  })

  it('should update logo transition state completely', () => {
    const { setLogoTransition } = useStore.getState()

    setLogoTransition({
      position: 'nav',
      scale: 1.0,
      progress: 1.0
    })

    expect(useStore.getState().logoTransition).toEqual({
      position: 'nav',
      scale: 1.0,
      progress: 1.0
    })
  })

  it('should update about state partially', () => {
    const { setAboutState } = useStore.getState()

    setAboutState({ pointsRevealed: 2 })

    const state = useStore.getState()
    expect(state.aboutState.pointsRevealed).toBe(2)
    expect(state.aboutState.showContent).toBe(false) // Should remain unchanged
    expect(state.aboutState.activePoint).toBe(-1) // Should remain unchanged
  })

  it('should update about state completely', () => {
    const { setAboutState } = useStore.getState()

    setAboutState({
      pointsRevealed: 4,
      showContent: true,
      activePoint: 3
    })

    expect(useStore.getState().aboutState).toEqual({
      pointsRevealed: 4,
      showContent: true,
      activePoint: 3
    })
  })

  it('should handle multiple state updates correctly', () => {
    const {
      updateScrollProgress,
      setIsScrolling,
      setShowNavigation,
      setActiveSection,
      setLogoTransition,
      setAboutState
    } = useStore.getState()

    // Simulate a scroll sequence
    updateScrollProgress(0.2)
    setIsScrolling(true)
    setShowNavigation(true)
    setActiveSection('about')
    setLogoTransition({ position: 'transitioning', progress: 0.5 })
    setAboutState({ pointsRevealed: 1, activePoint: 0 })

    const state = useStore.getState()

    expect(state.scrollProgress).toBe(0.2)
    expect(state.isScrolling).toBe(true)
    expect(state.showNavigation).toBe(true)
    expect(state.activeSection).toBe('about')
    expect(state.logoTransition).toEqual({
      position: 'transitioning',
      scale: 3.5, // Original value preserved
      progress: 0.5
    })
    expect(state.aboutState).toEqual({
      pointsRevealed: 1,
      showContent: false, // Original value preserved
      activePoint: 0
    })
  })

  it('should preserve existing intro scene functionality', () => {
    const state = useStore.getState()

    // Verify intro scene properties still exist
    expect(state.isIntroActive).toBeDefined()
    expect(state.isIntroComplete).toBeDefined()
    expect(state.currentPhase).toBeDefined()
    expect(state.userSkipPreference).toBeDefined()

    // Verify intro scene actions still exist
    expect(typeof state.startIntro).toBe('function')
    expect(typeof state.completeIntro).toBe('function')
    expect(typeof state.skipIntro).toBe('function')
    expect(typeof state.setPhase).toBe('function')
    expect(typeof state.setUserSkipPreference).toBe('function')
  })

  it('should preserve existing Lenis and scroll control functionality', () => {
    const state = useStore.getState()

    // Verify existing scroll properties still exist
    expect('lenis' in state).toBe(true)
    expect(state.scrollEnabled).toBeDefined()
    expect(state.overflow).toBeDefined()
    expect(state.thresholds).toBeDefined()

    // Verify existing scroll actions still exist
    expect(typeof state.setLenis).toBe('function')
    expect(typeof state.setScrollEnabled).toBe('function')
    expect(typeof state.setOverflow).toBe('function')
    expect(typeof state.addThreshold).toBe('function')
  })
})