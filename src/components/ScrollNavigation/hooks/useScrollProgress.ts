import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../../../lib/store'

export interface ScrollProgress {
  raw: number              // 0-1 raw scroll progress
  eased: number           // Eased progress for smooth animations
  velocity: number        // Scroll velocity for dynamic effects
  direction: 'up' | 'down' // Scroll direction
  zones: {
    [key: string]: {
      progress: number    // Zone-specific progress (0-1)
      isActive: boolean   // Whether currently in zone
    }
  }
}

export interface ScrollZone {
  start: number
  end: number
}

export interface ScrollZones {
  [key: string]: ScrollZone
}

// Default scroll trigger zones based on design document
export const defaultScrollZones: ScrollZones = {
  heroExit: { start: 0, end: 0.2 },        // CIS fade + logo start transition
  logoTransition: { start: 0.1, end: 0.4 }, // 3D logo move + scale
  navAppear: { start: 0.05, end: 1.0 },    // Navigation bar fade in - made more generous for testing
  aboutStart: { start: 0.4, end: 0.6 },    // About section entry
  aboutPointers: { start: 0.6, end: 0.8 }, // Progressive point reveals
  aboutContent: { start: 0.8, end: 1.0 }   // Main about content reveal
}

export const useScrollProgress = (customZones?: ScrollZones) => {
  const { lenis } = useStore()
  const zones = customZones || defaultScrollZones
  
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    raw: 0,
    eased: 0,
    velocity: 0,
    direction: 'down',
    zones: {}
  })

  // Calculate zone-specific progress
  const calculateZoneProgress = useCallback((progress: number, zone: ScrollZone) => {
    if (progress < zone.start) return { progress: 0, isActive: false }
    if (progress > zone.end) return { progress: 1, isActive: false }
    
    const zoneProgress = (progress - zone.start) / (zone.end - zone.start)
    return { progress: zoneProgress, isActive: true }
  }, [])

  // Easing function for smooth animations
  const easeOutCubic = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }, [])

  useEffect(() => {
    if (!lenis) return

    let lastProgress = 0
    let lastTime = Date.now()

    const handleScroll = ({ progress, velocity }: { progress: number; velocity: number }) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTime
      
      // Calculate direction based on progress change
      const direction = progress > lastProgress ? 'down' : 'up'
      
      // Calculate eased progress
      const easedProgress = easeOutCubic(progress)
      
      // Calculate zone-specific progress
      const zoneProgress: ScrollProgress['zones'] = {}
      Object.entries(zones).forEach(([key, zone]) => {
        zoneProgress[key] = calculateZoneProgress(progress, zone)
      })



      setScrollProgress({
        raw: progress,
        eased: easedProgress,
        velocity,
        direction,
        zones: zoneProgress
      })

      lastProgress = progress
      lastTime = currentTime
    }

    // Listen to Lenis scroll events
    lenis.on('scroll', handleScroll)

    return () => {
      lenis.off('scroll', handleScroll)
    }
  }, [lenis, zones, calculateZoneProgress, easeOutCubic])

  return scrollProgress
}