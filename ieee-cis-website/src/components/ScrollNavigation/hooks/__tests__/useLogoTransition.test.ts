import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogoTransition } from '../useLogoTransition'
import { useScrollProgress } from '../useScrollProgress'

// Mock the useScrollProgress hook
vi.mock('../useScrollProgress')

describe('useLogoTransition', () => {
  const mockScrollProgress = {
    raw: 0.25,
    eased: 0.3,
    velocity: 0.5,
    direction: 'down' as const,
    zones: {
      logoTransition: { progress: 0.5, isActive: true }
    }
  }

  beforeEach(() => {
    vi.mocked(useScrollProgress).mockReturnValue(mockScrollProgress)
  })

  it('should return default logo transition state when not transitioning', () => {
    const inactiveScrollProgress = {
      ...mockScrollProgress,
      zones: {
        logoTransition: { progress: 0, isActive: false }
      }
    }

    vi.mocked(useScrollProgress).mockReturnValue(inactiveScrollProgress)

    const { result } = renderHook(() => useLogoTransition())

    expect(result.current.position).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.current.scale).toBe(3.5)
    expect(result.current.rotation).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.current.progress).toBe(0)
    expect(result.current.isTransitioning).toBe(false)
    expect(result.current.disableMouseInteraction).toBe(false)
    expect(result.current.transitionRotationY).toBe(0)
  })

  it('should interpolate position during transition', () => {
    const { result } = renderHook(() => useLogoTransition())

    // With progress 0.5, position should be halfway between center and nav
    // Using cubic ease in-out: at 0.5 progress = 0.5
    const expectedProgress = 0.5
    
    expect(result.current.position.x).toBeCloseTo(-2 * expectedProgress, 2) // lerp(0, -2, easedProgress)
    expect(result.current.position.y).toBeCloseTo(1.5 * expectedProgress, 2) // lerp(0, 1.5, easedProgress)
    expect(result.current.position.z).toBe(0) // lerp(0, 0, easedProgress)
    expect(result.current.isTransitioning).toBe(true)
    expect(result.current.disableMouseInteraction).toBe(true)
    expect(result.current.transitionRotationY).toBe(expectedProgress)
  })

  it('should interpolate scale during transition', () => {
    const { result } = renderHook(() => useLogoTransition())

    // Scale should interpolate from 3.5 to 1.0
    const expectedProgress = 0.5 // cubic ease in-out(0.5)
    const expectedScale = 3.5 + (1.0 - 3.5) * expectedProgress // lerp(3.5, 1.0, easedProgress)
    
    expect(result.current.scale).toBeCloseTo(expectedScale, 2)
  })

  it('should use custom configuration when provided', () => {
    const customConfig = {
      centerPosition: { x: 1, y: 1, z: 1 },
      navPosition: { x: -3, y: 2, z: 0 },
      centerScale: 4.0,
      navScale: 0.5
    }

    const { result } = renderHook(() => useLogoTransition(customConfig))

    const expectedProgress = 0.5 // cubic ease in-out(0.5)
    
    // Position should use custom values
    expect(result.current.position.x).toBeCloseTo(1 + (-3 - 1) * expectedProgress, 2)
    expect(result.current.position.y).toBeCloseTo(1 + (2 - 1) * expectedProgress, 2)
    expect(result.current.position.z).toBeCloseTo(1 + (0 - 1) * expectedProgress, 2)
    
    // Scale should use custom values
    expect(result.current.scale).toBeCloseTo(4.0 + (0.5 - 4.0) * expectedProgress, 2)
  })

  it('should handle complete transition (progress = 1)', () => {
    const completeScrollProgress = {
      ...mockScrollProgress,
      zones: {
        logoTransition: { progress: 1, isActive: true }
      }
    }

    vi.mocked(useScrollProgress).mockReturnValue(completeScrollProgress)

    const { result } = renderHook(() => useLogoTransition())

    // At progress 1, should be at nav position with nav scale
    expect(result.current.position).toEqual({ x: -2, y: 1.5, z: 0 })
    expect(result.current.scale).toBe(1.0)
    expect(result.current.progress).toBe(1)
    expect(result.current.isTransitioning).toBe(true)
    expect(result.current.disableMouseInteraction).toBe(true)
    expect(result.current.transitionRotationY).toBe(1)
  })

  it('should handle beginning of transition (progress = 0)', () => {
    const startScrollProgress = {
      ...mockScrollProgress,
      zones: {
        logoTransition: { progress: 0, isActive: true }
      }
    }

    vi.mocked(useScrollProgress).mockReturnValue(startScrollProgress)

    const { result } = renderHook(() => useLogoTransition())

    // At progress 0, should be at center position with center scale
    expect(result.current.position).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.current.scale).toBe(3.5)
    expect(result.current.progress).toBe(0)
    expect(result.current.isTransitioning).toBe(true)
    expect(result.current.disableMouseInteraction).toBe(true)
    expect(result.current.transitionRotationY).toBe(0)
  })

  it('should handle missing logoTransition zone gracefully', () => {
    const noLogoZoneProgress = {
      ...mockScrollProgress,
      zones: {}
    }

    vi.mocked(useScrollProgress).mockReturnValue(noLogoZoneProgress)

    const { result } = renderHook(() => useLogoTransition())

    expect(result.current.position).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.current.scale).toBe(3.5)
    expect(result.current.progress).toBe(0)
    expect(result.current.isTransitioning).toBe(false)
    expect(result.current.disableMouseInteraction).toBe(false)
    expect(result.current.transitionRotationY).toBe(0)
  })

  it('should apply cubic ease in-out easing correctly', () => {
    // Test with different progress values to verify cubic ease in-out easing
    // For cubic ease in-out: t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const testCases = [
      { progress: 0, expected: 0 },
      { progress: 0.25, expected: 0.125 }, // 2 * 0.25 * 0.25 = 0.125
      { progress: 0.5, expected: 0.5 },    // boundary case
      { progress: 0.75, expected: 0.9375 }, // 1 - Math.pow(-2 * 0.75 + 2, 3) / 2 = 0.9375
      { progress: 1, expected: 1 }
    ]

    testCases.forEach(({ progress, expected }) => {
      const testScrollProgress = {
        ...mockScrollProgress,
        zones: {
          logoTransition: { progress, isActive: true }
        }
      }

      vi.mocked(useScrollProgress).mockReturnValue(testScrollProgress)

      const { result } = renderHook(() => useLogoTransition())
      expect(result.current.progress).toBeCloseTo(expected, 4)
    })
  })

  it('should disable mouse interaction during transition', () => {
    const transitioningScrollProgress = {
      ...mockScrollProgress,
      zones: {
        logoTransition: { progress: 0.3, isActive: true }
      }
    }

    vi.mocked(useScrollProgress).mockReturnValue(transitioningScrollProgress)

    const { result } = renderHook(() => useLogoTransition())

    expect(result.current.disableMouseInteraction).toBe(true)
    expect(result.current.isTransitioning).toBe(true)
  })

  it('should provide transition rotation Y for 360-degree rotation', () => {
    const testCases = [
      { progress: 0, expectedRotation: 0 },
      { progress: 0.25, expectedRotation: 0.125 }, // eased progress
      { progress: 0.5, expectedRotation: 0.5 },
      { progress: 0.75, expectedRotation: 0.9375 }, // eased progress
      { progress: 1, expectedRotation: 1 }
    ]

    testCases.forEach(({ progress, expectedRotation }) => {
      const testScrollProgress = {
        ...mockScrollProgress,
        zones: {
          logoTransition: { progress, isActive: true }
        }
      }

      vi.mocked(useScrollProgress).mockReturnValue(testScrollProgress)

      const { result } = renderHook(() => useLogoTransition())
      expect(result.current.transitionRotationY).toBeCloseTo(expectedRotation, 4)
    })
  })

  it('should enable mouse interaction when not transitioning', () => {
    const notTransitioningScrollProgress = {
      ...mockScrollProgress,
      zones: {
        logoTransition: { progress: 0, isActive: false }
      }
    }

    vi.mocked(useScrollProgress).mockReturnValue(notTransitioningScrollProgress)

    const { result } = renderHook(() => useLogoTransition())

    expect(result.current.disableMouseInteraction).toBe(false)
    expect(result.current.isTransitioning).toBe(false)
    expect(result.current.transitionRotationY).toBe(0)
  })
})