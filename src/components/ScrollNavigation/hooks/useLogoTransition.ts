import { useMemo } from 'react'
import { useScrollProgress } from './useScrollProgress'

export interface LogoTransition {
  position: {
    x: number
    y: number
    z: number
  }
  scale: number
  rotation: {
    x: number
    y: number
    z: number
  }
  progress: number        // Transition progress (0-1)
  isTransitioning: boolean
  disableMouseInteraction: boolean
  transitionRotationY: number // 360-degree rotation during transition
}

export interface LogoTransitionConfig {
  centerPosition: { x: number; y: number; z: number }
  navPosition: { x: number; y: number; z: number }
  centerScale: number
  navScale: number
  centerRotation: { x: number; y: number; z: number }
  navRotation: { x: number; y: number; z: number }
}

// Default configuration based on design requirements
const defaultConfig: LogoTransitionConfig = {
  centerPosition: { x: 0, y: 0, z: 0 },
  navPosition: { x: -2, y: 1.5, z: 0 }, // Left side of nav bar
  centerScale: 3.5, // Current scale from design
  navScale: 1.0,    // Target scale from design
  centerRotation: { x: 0, y: 0, z: 0 },
  navRotation: { x: 0, y: 0, z: 0 }
}

export const useLogoTransition = (config: Partial<LogoTransitionConfig> = {}) => {
  const scrollProgress = useScrollProgress()
  const finalConfig = { ...defaultConfig, ...config }

  const logoTransition = useMemo((): LogoTransition => {
    const logoZone = scrollProgress.zones.logoTransition
    const progress = logoZone?.progress || 0
    const isTransitioning = logoZone?.isActive || false

    // Smooth interpolation function
    const lerp = (start: number, end: number, t: number): number => {
      return start + (end - start) * t
    }

    // Eased progress for smoother transitions
    const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2 // cubic ease in-out

    return {
      position: {
        x: lerp(finalConfig.centerPosition.x, finalConfig.navPosition.x, easedProgress),
        y: lerp(finalConfig.centerPosition.y, finalConfig.navPosition.y, easedProgress),
        z: lerp(finalConfig.centerPosition.z, finalConfig.navPosition.z, easedProgress)
      },
      scale: lerp(finalConfig.centerScale, finalConfig.navScale, easedProgress),
      rotation: {
        x: lerp(finalConfig.centerRotation.x, finalConfig.navRotation.x, easedProgress),
        y: lerp(finalConfig.centerRotation.y, finalConfig.navRotation.y, easedProgress),
        z: lerp(finalConfig.centerRotation.z, finalConfig.navRotation.z, easedProgress)
      },
      progress: easedProgress,
      isTransitioning,
      disableMouseInteraction: isTransitioning,
      transitionRotationY: easedProgress // This will be used for 360-degree rotation
    }
  }, [scrollProgress, finalConfig])

  return logoTransition
}