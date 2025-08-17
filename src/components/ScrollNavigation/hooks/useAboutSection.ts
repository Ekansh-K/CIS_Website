import { useEffect, useRef } from 'react'
import { useStore } from '../../../lib/store'
import { useScrollProgress } from './useScrollProgress'

interface UseAboutSectionOptions {
  pointCount?: number
  revealThreshold?: number
  contentThreshold?: number
}

/**
 * useAboutSection Hook
 * 
 * Manages the about section scroll-based reveals and state updates.
 * Inspired by Lenis scroll threshold system for coordinated animations.
 */
export const useAboutSection = (options: UseAboutSectionOptions = {}) => {
  const {
    pointCount = 4,
    revealThreshold = 0.6,
    contentThreshold = 0.8
  } = options

  const sectionRef = useRef<HTMLElement>(null)
  const { addThreshold, aboutState, setAboutState } = useStore()
  const scrollProgress = useScrollProgress()

  // Register scroll thresholds for the about section
  useEffect(() => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const sectionTop = rect.top + scrollTop
    
    // Calculate thresholds based on section position
    const startThreshold = sectionTop - windowHeight * 0.5
    const endThreshold = sectionTop + rect.height - windowHeight * 0.5

    // Register main section thresholds
    addThreshold({ id: 'about-start', value: startThreshold })
    addThreshold({ id: 'about-end', value: endThreshold })

    // Register individual point thresholds
    for (let i = 0; i < pointCount; i++) {
      const pointProgress = (i + 1) / pointCount
      const pointThreshold = startThreshold + (endThreshold - startThreshold) * pointProgress * revealThreshold
      addThreshold({ id: `about-point-${i}`, value: pointThreshold })
    }

    // Register content reveal threshold
    const contentRevealThreshold = startThreshold + (endThreshold - startThreshold) * contentThreshold
    addThreshold({ id: 'about-content', value: contentRevealThreshold })

  }, [addThreshold, pointCount, revealThreshold, contentThreshold])

  // Update about state based on scroll progress in about zone
  useEffect(() => {
    const aboutZone = scrollProgress.zones.aboutStart
    if (!aboutZone) return

    const zoneProgress = aboutZone.progress
    const isInAboutSection = aboutZone.isActive

    if (isInAboutSection) {
      // Calculate how many points should be revealed
      const pointsToReveal = Math.min(
        Math.floor(zoneProgress * pointCount * (1 / revealThreshold)),
        pointCount
      )

      // Calculate active point (currently highlighting)
      const activePoint = Math.max(0, Math.min(pointsToReveal - 1, pointCount - 1))

      // Determine if main content should be shown
      const showContent = zoneProgress >= contentThreshold

      // Update store state
      setAboutState({
        pointsRevealed: pointsToReveal,
        activePoint: activePoint,
        showContent: showContent
      })
    }
  }, [scrollProgress, pointCount, revealThreshold, contentThreshold, setAboutState])

  // Calculate individual point progress for animations
  const getPointProgress = (pointIndex: number): number => {
    const aboutZone = scrollProgress.zones.aboutStart
    if (!aboutZone || !aboutZone.isActive) return 0

    const pointStartProgress = (pointIndex / pointCount) * revealThreshold
    const pointEndProgress = ((pointIndex + 1) / pointCount) * revealThreshold
    
    const zoneProgress = aboutZone.progress
    
    if (zoneProgress < pointStartProgress) return 0
    if (zoneProgress > pointEndProgress) return 1
    
    return (zoneProgress - pointStartProgress) / (pointEndProgress - pointStartProgress)
  }

  // Calculate content reveal progress
  const getContentProgress = (): number => {
    const aboutZone = scrollProgress.zones.aboutStart
    if (!aboutZone || !aboutZone.isActive) return 0

    const zoneProgress = aboutZone.progress
    
    if (zoneProgress < contentThreshold) return 0
    
    return (zoneProgress - contentThreshold) / (1 - contentThreshold)
  }

  return {
    sectionRef,
    aboutState,
    scrollProgress: scrollProgress.zones.aboutStart?.progress || 0,
    isInSection: scrollProgress.zones.aboutStart?.isActive || false,
    getPointProgress,
    getContentProgress
  }
}

export default useAboutSection