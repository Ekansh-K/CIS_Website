import { useEffect, useCallback } from 'react'
import { useScrollProgress, ScrollZones } from './useScrollProgress'

export interface ScrollTriggerCallbacks {
  onHeroExit?: (progress: number, isActive: boolean) => void
  onLogoTransition?: (progress: number, isActive: boolean) => void
  onNavAppear?: (progress: number, isActive: boolean) => void
  onAboutStart?: (progress: number, isActive: boolean) => void
  onAboutPointers?: (progress: number, isActive: boolean) => void
  onAboutContent?: (progress: number, isActive: boolean) => void
}

export const useScrollTriggers = (
  callbacks: ScrollTriggerCallbacks,
  customZones?: ScrollZones
) => {
  const scrollProgress = useScrollProgress(customZones)

  // Memoized callback handlers
  const handleZoneChange = useCallback((
    zoneName: keyof ScrollTriggerCallbacks,
    progress: number,
    isActive: boolean
  ) => {
    const callback = callbacks[zoneName]
    if (callback) {
      callback(progress, isActive)
    }
  }, [callbacks])

  // Effect to handle zone changes
  useEffect(() => {
    const { zones } = scrollProgress

    // Trigger callbacks for each zone
    Object.entries(zones).forEach(([zoneName, zoneData]) => {
      const callbackName = `on${zoneName.charAt(0).toUpperCase()}${zoneName.slice(1)}` as keyof ScrollTriggerCallbacks
      handleZoneChange(callbackName, zoneData.progress, zoneData.isActive)
    })
  }, [scrollProgress, handleZoneChange])

  return {
    scrollProgress,
    // Convenience getters for specific zones
    isHeroExiting: scrollProgress.zones.heroExit?.isActive || false,
    isLogoTransitioning: scrollProgress.zones.logoTransition?.isActive || false,
    isNavAppearing: scrollProgress.zones.navAppear?.isActive || false,
    isAboutStarting: scrollProgress.zones.aboutStart?.isActive || false,
    isAboutPointersActive: scrollProgress.zones.aboutPointers?.isActive || false,
    isAboutContentActive: scrollProgress.zones.aboutContent?.isActive || false,
  }
}