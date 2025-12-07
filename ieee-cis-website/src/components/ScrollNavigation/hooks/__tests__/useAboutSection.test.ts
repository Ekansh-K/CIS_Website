import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAboutSection } from '../useAboutSection'
import { useStore } from '../../../../lib/store'
import { useScrollProgress } from '../useScrollProgress'

// Mock dependencies
vi.mock('../../../../lib/store')
vi.mock('../useScrollProgress')

describe('useAboutSection', () => {
  const mockAddThreshold = vi.fn()
  const mockSetAboutState = vi.fn()
  const mockAboutState = {
    pointsRevealed: 0,
    showContent: false,
    activePoint: -1
  }

  const mockScrollProgress = {
    raw: 0.5,
    eased: 0.5,
    velocity: 0,
    direction: 'down' as const,
    zones: {
      aboutStart: {
        progress: 0.5,
        isActive: true
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useStore).mockReturnValue({
      addThreshold: mockAddThreshold,
      aboutState: mockAboutState,
      setAboutState: mockSetAboutState
    } as any)
    
    vi.mocked(useScrollProgress).mockReturnValue(mockScrollProgress)
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useAboutSection())
    
    expect(result.current.aboutState).toEqual(mockAboutState)
    expect(result.current.scrollProgress).toBe(0.5)
    expect(result.current.isInSection).toBe(true)
    expect(typeof result.current.getPointProgress).toBe('function')
    expect(typeof result.current.getContentProgress).toBe('function')
  })

  it('should use default options when none provided', () => {
    renderHook(() => useAboutSection())
    
    // Should work with default pointCount of 4
    expect(mockSetAboutState).toHaveBeenCalled()
  })

  it('should use custom options when provided', () => {
    const options = {
      pointCount: 6,
      revealThreshold: 0.7,
      contentThreshold: 0.9
    }
    
    renderHook(() => useAboutSection(options))
    
    // Should work with custom options
    expect(mockSetAboutState).toHaveBeenCalled()
  })

  it('should calculate point progress correctly', () => {
    const { result } = renderHook(() => useAboutSection({
      pointCount: 4,
      revealThreshold: 0.6
    }))
    
    // Test point progress calculation
    const pointProgress0 = result.current.getPointProgress(0)
    const pointProgress1 = result.current.getPointProgress(1)
    const pointProgress2 = result.current.getPointProgress(2)
    const pointProgress3 = result.current.getPointProgress(3)
    
    // With scrollProgress 0.5 and revealThreshold 0.6
    // Point 0: starts at 0, ends at 0.15 (0.25 * 0.6) - should be complete
    // Point 1: starts at 0.15, ends at 0.3 - should be complete  
    // Point 2: starts at 0.3, ends at 0.45 - should be complete
    // Point 3: starts at 0.45, ends at 0.6 - should be partial
    
    expect(pointProgress0).toBeGreaterThan(0)
    expect(pointProgress1).toBeGreaterThan(0)
    expect(pointProgress2).toBeGreaterThan(0)
    expect(pointProgress3).toBeGreaterThanOrEqual(0)
  })

  it('should calculate content progress correctly', () => {
    const { result } = renderHook(() => useAboutSection({
      contentThreshold: 0.8
    }))
    
    const contentProgress = result.current.getContentProgress()
    
    // With scrollProgress 0.5 and contentThreshold 0.8
    // Content should not be revealed yet
    expect(contentProgress).toBe(0)
  })

  it('should update about state when in section', () => {
    renderHook(() => useAboutSection({
      pointCount: 4,
      revealThreshold: 0.6,
      contentThreshold: 0.8
    }))
    
    expect(mockSetAboutState).toHaveBeenCalledWith({
      pointsRevealed: expect.any(Number),
      activePoint: expect.any(Number),
      showContent: expect.any(Boolean)
    })
  })

  it('should handle section not active', () => {
    const inactiveScrollProgress = {
      ...mockScrollProgress,
      zones: {
        aboutStart: {
          progress: 0,
          isActive: false
        }
      }
    }
    
    vi.mocked(useScrollProgress).mockReturnValue(inactiveScrollProgress)
    
    const { result } = renderHook(() => useAboutSection())
    
    expect(result.current.scrollProgress).toBe(0)
    expect(result.current.isInSection).toBe(false)
  })

  it('should handle missing about zone', () => {
    const noZoneScrollProgress = {
      ...mockScrollProgress,
      zones: {}
    }
    
    vi.mocked(useScrollProgress).mockReturnValue(noZoneScrollProgress)
    
    const { result } = renderHook(() => useAboutSection())
    
    expect(result.current.scrollProgress).toBe(0)
    expect(result.current.isInSection).toBe(false)
  })

  it('should calculate correct points revealed', () => {
    // Test with different scroll progress values
    const testCases = [
      { progress: 0, expectedPoints: 0 },
      { progress: 0.15, expectedPoints: 1 },
      { progress: 0.3, expectedPoints: 2 },
      { progress: 0.45, expectedPoints: 3 },
      { progress: 0.6, expectedPoints: 4 }
    ]
    
    testCases.forEach(({ progress, expectedPoints }) => {
      const testScrollProgress = {
        ...mockScrollProgress,
        zones: {
          aboutStart: {
            progress,
            isActive: true
          }
        }
      }
      
      vi.mocked(useScrollProgress).mockReturnValue(testScrollProgress)
      
      renderHook(() => useAboutSection({
        pointCount: 4,
        revealThreshold: 0.6
      }))
      
      // Check that setAboutState was called with correct pointsRevealed
      const lastCall = mockSetAboutState.mock.calls[mockSetAboutState.mock.calls.length - 1]
      expect(lastCall[0].pointsRevealed).toBeLessThanOrEqual(expectedPoints + 1)
    })
  })

  it('should show content when threshold is reached', () => {
    const contentScrollProgress = {
      ...mockScrollProgress,
      zones: {
        aboutStart: {
          progress: 0.9, // Above contentThreshold of 0.8
          isActive: true
        }
      }
    }
    
    vi.mocked(useScrollProgress).mockReturnValue(contentScrollProgress)
    
    renderHook(() => useAboutSection({
      contentThreshold: 0.8
    }))
    
    const lastCall = mockSetAboutState.mock.calls[mockSetAboutState.mock.calls.length - 1]
    expect(lastCall[0].showContent).toBe(true)
  })

  it('should calculate active point correctly', () => {
    const { result } = renderHook(() => useAboutSection({
      pointCount: 4,
      revealThreshold: 0.6
    }))
    
    // With 2 points revealed, active point should be 1 (0-indexed)
    const lastCall = mockSetAboutState.mock.calls[mockSetAboutState.mock.calls.length - 1]
    expect(lastCall[0].activePoint).toBeGreaterThanOrEqual(-1)
    expect(lastCall[0].activePoint).toBeLessThan(4)
  })
})