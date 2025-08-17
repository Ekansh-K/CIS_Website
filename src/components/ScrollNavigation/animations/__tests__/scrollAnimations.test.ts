import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  ScrollAnimationController, 
  scrollAnimationController,
  easingFunctions,
  animationUtils
} from '../scrollAnimations'
import type { ScrollProgress } from '../../hooks/useScrollProgress'

describe('ScrollAnimationController', () => {
  let controller: ScrollAnimationController
  let mockScrollProgress: ScrollProgress

  beforeEach(() => {
    controller = new ScrollAnimationController()
    mockScrollProgress = {
      raw: 0.5,
      eased: 0.6,
      velocity: 0.3,
      direction: 'down',
      zones: {
        testZone: { progress: 0.7, isActive: true }
      }
    }
  })

  it('should initialize with default state', () => {
    expect(controller.active).toBe(false)
    expect(controller.callbackCount).toBe(0)
  })

  it('should register and unregister callbacks', () => {
    const callback = vi.fn()

    controller.register('test', callback)
    expect(controller.callbackCount).toBe(1)

    controller.unregister('test')
    expect(controller.callbackCount).toBe(0)
  })

  it('should start and stop animation system', () => {
    expect(controller.active).toBe(false)

    controller.start()
    expect(controller.active).toBe(true)

    controller.stop()
    expect(controller.active).toBe(false)
  })

  it('should call registered callbacks when active', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    controller.register('test1', callback1)
    controller.register('test2', callback2)
    controller.start()

    controller.update(mockScrollProgress)

    expect(callback1).toHaveBeenCalledWith(mockScrollProgress)
    expect(callback2).toHaveBeenCalledWith(mockScrollProgress)
  })

  it('should not call callbacks when inactive', () => {
    const callback = vi.fn()

    controller.register('test', callback)
    // Don't start the controller

    controller.update(mockScrollProgress)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should handle callback errors gracefully', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Test error')
    })
    const normalCallback = vi.fn()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    controller.register('error', errorCallback)
    controller.register('normal', normalCallback)
    controller.start()

    controller.update(mockScrollProgress)

    expect(errorCallback).toHaveBeenCalled()
    expect(normalCallback).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      'ScrollAnimationController: Animation callback error:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should allow multiple registrations and updates', () => {
    const callback = vi.fn()

    controller.register('test', callback)
    controller.start()

    controller.update(mockScrollProgress)
    controller.update(mockScrollProgress)

    expect(callback).toHaveBeenCalledTimes(2)
  })
})

describe('easingFunctions', () => {
  it('should provide linear easing', () => {
    expect(easingFunctions.linear(0)).toBe(0)
    expect(easingFunctions.linear(0.5)).toBe(0.5)
    expect(easingFunctions.linear(1)).toBe(1)
  })

  it('should provide easeInOut (cubic) easing', () => {
    expect(easingFunctions.easeInOut(0)).toBe(0)
    expect(easingFunctions.easeInOut(0.5)).toBe(0.5) // cubic ease in-out at midpoint
    expect(easingFunctions.easeInOut(1)).toBe(1)
  })

  it('should provide easeOut easing', () => {
    expect(easingFunctions.easeOut(0)).toBe(0)
    expect(easingFunctions.easeOut(1)).toBe(1)
    // easeOut should be faster at the beginning
    expect(easingFunctions.easeOut(0.5)).toBeGreaterThan(0.5)
  })

  it('should provide easeIn easing', () => {
    expect(easingFunctions.easeIn(0)).toBe(0)
    expect(easingFunctions.easeIn(1)).toBe(1)
    // easeIn should be slower at the beginning
    expect(easingFunctions.easeIn(0.5)).toBeLessThan(0.5)
  })

  it('should provide bounce easing', () => {
    expect(easingFunctions.bounce(0)).toBe(0)
    expect(easingFunctions.bounce(1)).toBeCloseTo(1, 5)
    // Bounce should have characteristic bouncing behavior
    expect(easingFunctions.bounce(0.5)).toBeGreaterThan(0)
  })
})

describe('animationUtils', () => {
  it('should interpolate between two values', () => {
    expect(animationUtils.lerp(0, 10, 0)).toBe(0)
    expect(animationUtils.lerp(0, 10, 0.5)).toBe(5)
    expect(animationUtils.lerp(0, 10, 1)).toBe(10)
    expect(animationUtils.lerp(-5, 5, 0.5)).toBe(0)
  })

  it('should interpolate between two 3D positions', () => {
    const start = { x: 0, y: 0, z: 0 }
    const end = { x: 10, y: 20, z: 30 }

    const result = animationUtils.lerpPosition(start, end, 0.5)

    expect(result).toEqual({ x: 5, y: 10, z: 15 })
  })

  it('should clamp values between min and max', () => {
    expect(animationUtils.clamp(5, 0, 10)).toBe(5)
    expect(animationUtils.clamp(-5, 0, 10)).toBe(0)
    expect(animationUtils.clamp(15, 0, 10)).toBe(10)
  })

  it('should map values from one range to another', () => {
    expect(animationUtils.mapRange(5, 0, 10, 0, 100)).toBe(50)
    expect(animationUtils.mapRange(0, 0, 10, 0, 100)).toBe(0)
    expect(animationUtils.mapRange(10, 0, 10, 0, 100)).toBe(100)
    expect(animationUtils.mapRange(2.5, 0, 10, -50, 50)).toBe(-25)
  })

  it('should get zone progress with easing', () => {
    const scrollProgress: ScrollProgress = {
      raw: 0.5,
      eased: 0.6,
      velocity: 0.3,
      direction: 'down',
      zones: {
        testZone: { progress: 0.5, isActive: true },
        inactiveZone: { progress: 0, isActive: false }
      }
    }

    // Test with default easing (easeInOut)
    const result1 = animationUtils.getZoneProgress(scrollProgress, 'testZone')
    expect(result1).toBe(0.5) // easeInOut(0.5) for cubic

    // Test with linear easing
    const result2 = animationUtils.getZoneProgress(scrollProgress, 'testZone', 'linear')
    expect(result2).toBe(0.5)

    // Test with non-existent zone
    const result3 = animationUtils.getZoneProgress(scrollProgress, 'nonExistent')
    expect(result3).toBe(0)
  })
})

describe('scrollAnimationController (global instance)', () => {
  it('should be a singleton instance', () => {
    expect(scrollAnimationController).toBeInstanceOf(ScrollAnimationController)
  })

  it('should maintain state across imports', () => {
    const callback = vi.fn()

    scrollAnimationController.register('global-test', callback)
    expect(scrollAnimationController.callbackCount).toBe(1)

    scrollAnimationController.unregister('global-test')
    expect(scrollAnimationController.callbackCount).toBe(0)
  })
})