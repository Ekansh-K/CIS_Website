import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useScrollTriggers } from '../useScrollTriggers'
import { useScrollProgress } from '../useScrollProgress'

// Mock the useScrollProgress hook
vi.mock('../useScrollProgress')

describe('useScrollTriggers', () => {
  const mockScrollProgress = {
    raw: 0.3,
    eased: 0.4,
    velocity: 0.5,
    direction: 'down' as const,
    zones: {
      heroExit: { progress: 1, isActive: false },
      logoTransition: { progress: 0.67, isActive: true },
      navAppear: { progress: 1, isActive: false },
      aboutStart: { progress: 0, isActive: false },
      aboutPointers: { progress: 0, isActive: false },
      aboutContent: { progress: 0, isActive: false }
    }
  }

  beforeEach(() => {
    vi.mocked(useScrollProgress).mockReturnValue(mockScrollProgress)
  })

  it('should return scroll progress and convenience getters', () => {
    const callbacks = {}
    const { result } = renderHook(() => useScrollTriggers(callbacks))

    expect(result.current.scrollProgress).toBe(mockScrollProgress)
    expect(result.current.isHeroExiting).toBe(false)
    expect(result.current.isLogoTransitioning).toBe(true)
    expect(result.current.isNavAppearing).toBe(false)
    expect(result.current.isAboutStarting).toBe(false)
    expect(result.current.isAboutPointersActive).toBe(false)
    expect(result.current.isAboutContentActive).toBe(false)
  })

  it('should call appropriate callbacks when zones are active', () => {
    const onHeroExit = vi.fn()
    const onLogoTransition = vi.fn()
    const onNavAppear = vi.fn()

    const callbacks = {
      onHeroExit,
      onLogoTransition,
      onNavAppear
    }

    renderHook(() => useScrollTriggers(callbacks))

    expect(onHeroExit).toHaveBeenCalledWith(1, false)
    expect(onLogoTransition).toHaveBeenCalledWith(0.67, true)
    expect(onNavAppear).toHaveBeenCalledWith(1, false)
  })

  it('should not call callbacks that are not provided', () => {
    const onLogoTransition = vi.fn()

    const callbacks = {
      onLogoTransition
    }

    renderHook(() => useScrollTriggers(callbacks))

    expect(onLogoTransition).toHaveBeenCalledWith(0.67, true)
    // Other callbacks should not be called since they're not provided
  })

  it('should handle empty callbacks object', () => {
    const callbacks = {}

    expect(() => {
      renderHook(() => useScrollTriggers(callbacks))
    }).not.toThrow()
  })

  it('should update when scroll progress changes', () => {
    const onLogoTransition = vi.fn()
    const callbacks = { onLogoTransition }

    const { rerender } = renderHook(() => useScrollTriggers(callbacks))

    expect(onLogoTransition).toHaveBeenCalledWith(0.67, true)

    // Update mock to simulate scroll progress change
    const updatedScrollProgress = {
      ...mockScrollProgress,
      zones: {
        ...mockScrollProgress.zones,
        logoTransition: { progress: 0.8, isActive: true }
      }
    }

    vi.mocked(useScrollProgress).mockReturnValue(updatedScrollProgress)
    rerender()

    expect(onLogoTransition).toHaveBeenCalledWith(0.8, true)
  })

  it('should handle all callback types correctly', () => {
    const callbacks = {
      onHeroExit: vi.fn(),
      onLogoTransition: vi.fn(),
      onNavAppear: vi.fn(),
      onAboutStart: vi.fn(),
      onAboutPointers: vi.fn(),
      onAboutContent: vi.fn()
    }

    renderHook(() => useScrollTriggers(callbacks))

    expect(callbacks.onHeroExit).toHaveBeenCalledWith(1, false)
    expect(callbacks.onLogoTransition).toHaveBeenCalledWith(0.67, true)
    expect(callbacks.onNavAppear).toHaveBeenCalledWith(1, false)
    expect(callbacks.onAboutStart).toHaveBeenCalledWith(0, false)
    expect(callbacks.onAboutPointers).toHaveBeenCalledWith(0, false)
    expect(callbacks.onAboutContent).toHaveBeenCalledWith(0, false)
  })

  it('should pass custom zones to useScrollProgress', () => {
    const customZones = {
      customZone: { start: 0.1, end: 0.9 }
    }

    const callbacks = {}

    renderHook(() => useScrollTriggers(callbacks, customZones))

    expect(useScrollProgress).toHaveBeenCalledWith(customZones)
  })
})