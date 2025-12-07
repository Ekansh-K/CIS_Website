import { ScrollProgress } from '../hooks/useScrollProgress'

// Animation timing and easing functions
export const easingFunctions = {
  linear: (t: number): number => t,
  easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // cubic ease in-out
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number): number => t * t * t,
  bounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  }
}

// Coordinated scroll animation controller
export class ScrollAnimationController {
  private callbacks: Map<string, (progress: ScrollProgress) => void> = new Map()
  private isActive = false

  // Register animation callback
  register(id: string, callback: (progress: ScrollProgress) => void): void {
    this.callbacks.set(id, callback)
  }

  // Unregister animation callback
  unregister(id: string): void {
    this.callbacks.delete(id)
  }

  // Update all registered animations
  update(progress: ScrollProgress): void {
    if (!this.isActive) return

    this.callbacks.forEach((callback) => {
      try {
        callback(progress)
      } catch (error) {
        console.warn('ScrollAnimationController: Animation callback error:', error)
      }
    })
  }

  // Start animation system
  start(): void {
    this.isActive = true
  }

  // Stop animation system
  stop(): void {
    this.isActive = false
  }

  // Get current state
  get active(): boolean {
    return this.isActive
  }

  // Get registered callback count
  get callbackCount(): number {
    return this.callbacks.size
  }
}

// Global animation controller instance
export const scrollAnimationController = new ScrollAnimationController()

// Utility functions for common animations
export const animationUtils = {
  // Interpolate between two values
  lerp: (start: number, end: number, t: number): number => {
    return start + (end - start) * t
  },

  // Interpolate between two 3D positions
  lerpPosition: (
    start: { x: number; y: number; z: number },
    end: { x: number; y: number; z: number },
    t: number
  ) => ({
    x: animationUtils.lerp(start.x, end.x, t),
    y: animationUtils.lerp(start.y, end.y, t),
    z: animationUtils.lerp(start.z, end.z, t)
  }),

  // Clamp value between min and max
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  },

  // Map value from one range to another
  mapRange: (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  },

  // Get zone progress with easing
  getZoneProgress: (
    scrollProgress: ScrollProgress,
    zoneName: string,
    easing: keyof typeof easingFunctions = 'easeInOut'
  ): number => {
    const zone = scrollProgress.zones[zoneName]
    if (!zone) return 0

    const easingFn = easingFunctions[easing]
    return easingFn(zone.progress)
  }
}