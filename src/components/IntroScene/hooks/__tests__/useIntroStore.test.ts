import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIntroStore } from '../useIntroStore'
import { useStore } from '../../../../lib/store'

describe('useIntroStore Hook', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      isIntroActive: false,
      isIntroComplete: false,
      currentPhase: 'loading',
      userSkipPreference: false,
    })
  })

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useIntroStore())
    
    expect(result.current.isIntroActive).toBe(false)
    expect(result.current.isIntroComplete).toBe(false)
    expect(result.current.currentPhase).toBe('loading')
    expect(result.current.userSkipPreference).toBe(false)
  })

  it('should return computed values correctly', () => {
    const { result } = renderHook(() => useIntroStore())
    
    // Initial state: should show intro, not in progress
    expect(result.current.shouldShowIntro).toBe(true)
    expect(result.current.isIntroInProgress).toBe(false)
  })

  it('should update shouldShowIntro when user has skip preference', () => {
    const { result } = renderHook(() => useIntroStore())
    
    act(() => {
      result.current.setUserSkipPreference(true)
    })
    
    expect(result.current.shouldShowIntro).toBe(false)
  })

  it('should update shouldShowIntro when intro is complete', () => {
    const { result } = renderHook(() => useIntroStore())
    
    act(() => {
      result.current.completeIntro()
    })
    
    expect(result.current.shouldShowIntro).toBe(false)
  })

  it('should update isIntroInProgress when intro is active and animating', () => {
    const { result } = renderHook(() => useIntroStore())
    
    act(() => {
      result.current.startIntro()
    })
    
    expect(result.current.isIntroInProgress).toBe(true)
  })

  it('should not show isIntroInProgress when intro is active but not animating', () => {
    const { result } = renderHook(() => useIntroStore())
    
    act(() => {
      result.current.startIntro()
      result.current.setPhase('loading')
    })
    
    expect(result.current.isIntroInProgress).toBe(false)
  })

  it('should provide all store actions', () => {
    const { result } = renderHook(() => useIntroStore())
    
    expect(typeof result.current.startIntro).toBe('function')
    expect(typeof result.current.completeIntro).toBe('function')
    expect(typeof result.current.skipIntro).toBe('function')
    expect(typeof result.current.setPhase).toBe('function')
    expect(typeof result.current.setUserSkipPreference).toBe('function')
  })

  it('should handle complete intro lifecycle through hook', () => {
    const { result } = renderHook(() => useIntroStore())
    
    // Start intro
    act(() => {
      result.current.startIntro()
    })
    
    expect(result.current.isIntroActive).toBe(true)
    expect(result.current.isIntroInProgress).toBe(true)
    expect(result.current.shouldShowIntro).toBe(true)
    
    // Complete intro
    act(() => {
      result.current.completeIntro()
    })
    
    expect(result.current.isIntroActive).toBe(false)
    expect(result.current.isIntroComplete).toBe(true)
    expect(result.current.isIntroInProgress).toBe(false)
    expect(result.current.shouldShowIntro).toBe(false)
  })

  it('should handle skip intro lifecycle through hook', () => {
    const { result } = renderHook(() => useIntroStore())
    
    // Start intro
    act(() => {
      result.current.startIntro()
    })
    
    expect(result.current.shouldShowIntro).toBe(true)
    expect(result.current.isIntroInProgress).toBe(true)
    
    // Skip intro
    act(() => {
      result.current.skipIntro()
    })
    
    expect(result.current.isIntroActive).toBe(false)
    expect(result.current.isIntroComplete).toBe(true)
    expect(result.current.userSkipPreference).toBe(true)
    expect(result.current.isIntroInProgress).toBe(false)
    expect(result.current.shouldShowIntro).toBe(false)
  })
})