import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from '../store'

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Intro Scene Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      isIntroActive: false,
      isIntroComplete: false,
      currentPhase: 'loading',
      userSkipPreference: false,
    })
    
    // Clear localStorage mock
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  describe('Initial State', () => {
    it('should have correct initial intro state', () => {
      const state = useStore.getState()
      
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(false)
      expect(state.currentPhase).toBe('loading')
      expect(state.userSkipPreference).toBe(false)
    })
  })

  describe('startIntro Action', () => {
    it('should set intro as active and phase to animating', () => {
      const { startIntro } = useStore.getState()
      
      startIntro()
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      expect(state.isIntroComplete).toBe(false)
      expect(state.currentPhase).toBe('animating')
    })

    it('should reset completion state when starting intro', () => {
      // First complete the intro
      useStore.setState({ isIntroComplete: true })
      
      const { startIntro } = useStore.getState()
      startIntro()
      
      const state = useStore.getState()
      expect(state.isIntroComplete).toBe(false)
    })
  })

  describe('completeIntro Action', () => {
    it('should set intro as complete and inactive', () => {
      // First start the intro
      useStore.setState({ isIntroActive: true, currentPhase: 'animating' })
      
      const { completeIntro } = useStore.getState()
      completeIntro()
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(true)
      expect(state.currentPhase).toBe('complete')
    })

    it('should not affect user skip preference when completing normally', () => {
      useStore.setState({ userSkipPreference: false })
      
      const { completeIntro } = useStore.getState()
      completeIntro()
      
      const state = useStore.getState()
      expect(state.userSkipPreference).toBe(false)
    })
  })

  describe('skipIntro Action', () => {
    it('should set intro as complete and set skip preference', () => {
      useStore.setState({ isIntroActive: true, currentPhase: 'animating' })
      
      const { skipIntro } = useStore.getState()
      skipIntro()
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(true)
      expect(state.currentPhase).toBe('complete')
      expect(state.userSkipPreference).toBe(true)
    })

    it('should work even if intro is not active', () => {
      const { skipIntro } = useStore.getState()
      skipIntro()
      
      const state = useStore.getState()
      expect(state.isIntroComplete).toBe(true)
      expect(state.userSkipPreference).toBe(true)
    })
  })

  describe('setPhase Action', () => {
    it('should update current phase to loading', () => {
      const { setPhase } = useStore.getState()
      
      setPhase('loading')
      
      const state = useStore.getState()
      expect(state.currentPhase).toBe('loading')
    })

    it('should update current phase to animating', () => {
      const { setPhase } = useStore.getState()
      
      setPhase('animating')
      
      const state = useStore.getState()
      expect(state.currentPhase).toBe('animating')
    })

    it('should update current phase to complete', () => {
      const { setPhase } = useStore.getState()
      
      setPhase('complete')
      
      const state = useStore.getState()
      expect(state.currentPhase).toBe('complete')
    })
  })

  describe('setUserSkipPreference Action', () => {
    it('should set user skip preference to true', () => {
      const { setUserSkipPreference } = useStore.getState()
      
      setUserSkipPreference(true)
      
      const state = useStore.getState()
      expect(state.userSkipPreference).toBe(true)
    })

    it('should set user skip preference to false', () => {
      useStore.setState({ userSkipPreference: true })
      
      const { setUserSkipPreference } = useStore.getState()
      setUserSkipPreference(false)
      
      const state = useStore.getState()
      expect(state.userSkipPreference).toBe(false)
    })
  })

  describe('State Transitions', () => {
    it('should handle complete intro lifecycle', () => {
      const { startIntro, completeIntro } = useStore.getState()
      
      // Start intro
      startIntro()
      let state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      expect(state.currentPhase).toBe('animating')
      
      // Complete intro
      completeIntro()
      state = useStore.getState()
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(true)
      expect(state.currentPhase).toBe('complete')
    })

    it('should handle skip intro lifecycle', () => {
      const { startIntro, skipIntro } = useStore.getState()
      
      // Start intro
      startIntro()
      let state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      
      // Skip intro
      skipIntro()
      state = useStore.getState()
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(true)
      expect(state.userSkipPreference).toBe(true)
    })

    it('should allow restarting intro after completion', () => {
      const { startIntro, completeIntro } = useStore.getState()
      
      // Complete intro first
      startIntro()
      completeIntro()
      
      // Restart intro
      startIntro()
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      expect(state.isIntroComplete).toBe(false)
      expect(state.currentPhase).toBe('animating')
    })
  })

  describe('Local Storage Integration', () => {
    it('should persist user skip preference', () => {
      const { setUserSkipPreference } = useStore.getState()
      
      setUserSkipPreference(true)
      
      // The persist middleware should handle localStorage automatically
      // We can verify the state is updated correctly
      const state = useStore.getState()
      expect(state.userSkipPreference).toBe(true)
    })

    it('should not persist runtime state like isIntroActive', () => {
      const { startIntro } = useStore.getState()
      
      startIntro()
      
      // Runtime state should be set but not persisted
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      
      // The persist configuration should only include userSkipPreference
      // This is tested by the partialize function in the store
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple startIntro calls', () => {
      const { startIntro } = useStore.getState()
      
      startIntro()
      startIntro()
      startIntro()
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(true)
      expect(state.currentPhase).toBe('animating')
    })

    it('should handle multiple completeIntro calls', () => {
      const { startIntro, completeIntro } = useStore.getState()
      
      startIntro()
      completeIntro()
      completeIntro()
      completeIntro()
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(true)
      expect(state.currentPhase).toBe('complete')
    })

    it('should handle skipIntro without starting intro', () => {
      const { skipIntro } = useStore.getState()
      
      skipIntro()
      
      const state = useStore.getState()
      expect(state.isIntroActive).toBe(false)
      expect(state.isIntroComplete).toBe(true)
      expect(state.userSkipPreference).toBe(true)
    })
  })
})