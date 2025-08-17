import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrollProgress, defaultScrollZones } from '../useScrollProgress'
import { useStore } from '../../../../lib/store'

// Mock the store
vi.mock('../../../../lib/store')

describe('useScrollProgress', () => {
  let mockLenis: any
  let mockSetState: any

  beforeEach(() => {
    mockLenis = {
      on: vi.fn(),
      off: vi.fn()
    }

    mockSetState = vi.fn()

    vi.mocked(useStore).mockReturnValue({
      lenis: mockLenis,
      // Add other store properties as needed
    } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default scroll progress values', () => {
    const { result } = renderHook(() => useScrollProgress())

    expect(result.current.raw).toBe(0)
    expect(result.current.eased).toBe(0)
    expect(result.current.velocity).toBe(0)
    expect(result.current.direction).toBe('down')
    expect(result.current.zones).toEqual({})
  })

  it('should register scroll listener when lenis is available', () => {
    renderHook(() => useScrollProgress())

    expect(mockLenis.on).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('should not register scroll listener when lenis is undefined', () => {
    vi.mocked(useStore).mockReturnValue({
      lenis: undefined,
    } as any)

    renderHook(() => useScrollProgress())

    expect(mockLenis.on).not.toHaveBeenCalled()
  })

  it('should calculate zone progress correctly', () => {
    const { result } = renderHook(() => useScrollProgress())

    // Get the scroll handler that was registered
    const scrollHandler = mockLenis.on.mock.calls[0][1]

    act(() => {
      scrollHandler({ progress: 0.3, velocity: 0.5 })
    })

    // Check that zones are calculated correctly
    const zones = result.current.zones
    
    // heroExit zone (0-0.2) should be complete at 0.3
    expect(zones.heroExit?.progress).toBe(1)
    expect(zones.heroExit?.isActive).toBe(false)

    // logoTransition zone (0.1-0.4) should be active at 0.3
    expect(zones.logoTransition?.progress).toBeCloseTo(0.67, 1) // (0.3-0.1)/(0.4-0.1)
    expect(zones.logoTransition?.isActive).toBe(true)

    // navAppear zone (0.15-0.25) should be complete at 0.3
    expect(zones.navAppear?.progress).toBe(1)
    expect(zones.navAppear?.isActive).toBe(false)
  })

  it('should detect scroll direction correctly', () => {
    const { result } = renderHook(() => useScrollProgress())
    const scrollHandler = mockLenis.on.mock.calls[0][1]

    // First scroll down
    act(() => {
      scrollHandler({ progress: 0.3, velocity: 0.5 })
    })
    expect(result.current.direction).toBe('down')

    // Then scroll up
    act(() => {
      scrollHandler({ progress: 0.1, velocity: -0.5 })
    })
    expect(result.current.direction).toBe('up')
  })

  it('should apply easing to progress', () => {
    const { result } = renderHook(() => useScrollProgress())
    const scrollHandler = mockLenis.on.mock.calls[0][1]

    act(() => {
      scrollHandler({ progress: 0.5, velocity: 0 })
    })

    // Eased progress should be different from raw progress due to easeOutCubic
    expect(result.current.raw).toBe(0.5)
    expect(result.current.eased).not.toBe(0.5)
    expect(result.current.eased).toBeCloseTo(0.875, 2) // easeOutCubic(0.5)
  })

  it('should use custom zones when provided', () => {
    const customZones = {
      customZone: { start: 0.2, end: 0.8 }
    }

    const { result } = renderHook(() => useScrollProgress(customZones))
    const scrollHandler = mockLenis.on.mock.calls[0][1]

    act(() => {
      scrollHandler({ progress: 0.5, velocity: 0 })
    })

    expect(result.current.zones.customZone).toBeDefined()
    expect(result.current.zones.customZone?.progress).toBeCloseTo(0.5, 10) // (0.5-0.2)/(0.8-0.2)
    expect(result.current.zones.customZone?.isActive).toBe(true)
  })

  it('should cleanup scroll listener on unmount', () => {
    const { unmount } = renderHook(() => useScrollProgress())

    unmount()

    expect(mockLenis.off).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('should handle velocity updates', () => {
    const { result } = renderHook(() => useScrollProgress())
    const scrollHandler = mockLenis.on.mock.calls[0][1]

    act(() => {
      scrollHandler({ progress: 0.3, velocity: 1.5 })
    })

    expect(result.current.velocity).toBe(1.5)
  })

  it('should handle zone boundaries correctly', () => {
    const { result } = renderHook(() => useScrollProgress())
    const scrollHandler = mockLenis.on.mock.calls[0][1]

    // Test before zone start
    act(() => {
      scrollHandler({ progress: 0.05, velocity: 0 })
    })
    expect(result.current.zones.heroExit?.progress).toBe(0.25) // (0.05-0)/(0.2-0)
    expect(result.current.zones.heroExit?.isActive).toBe(true)

    // Test after zone end
    act(() => {
      scrollHandler({ progress: 0.25, velocity: 0 })
    })
    expect(result.current.zones.heroExit?.progress).toBe(1)
    expect(result.current.zones.heroExit?.isActive).toBe(false)
  })
})