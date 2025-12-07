import React from 'react'
import { ScrollNavBar } from './components/ScrollNavBar'
import { useStore } from '../../lib/store'

interface ScrollNavigationProps {
  className?: string
}

/**
 * Main ScrollNavigation component that orchestrates the scroll-triggered navigation system
 * Includes the glass morphism navigation bar that appears on scroll
 */
export const ScrollNavigation: React.FC<ScrollNavigationProps> = ({ className = '' }) => {
  const { isIntroComplete, isIntroActive } = useStore()

  // Don't render navigation during intro
  if (isIntroActive || !isIntroComplete) {
    return null
  }

  return (
    <div className={`scroll-navigation ${className}`}>
      <ScrollNavBar />
    </div>
  )
}

export default ScrollNavigation

// Export individual components for direct use
export { ScrollNavBar } from './components/ScrollNavBar'
export { ScrollLogo3D } from './components/ScrollLogo3D'
export { AboutSection } from './components/AboutSection'
export { TeamSection } from './components/TeamSection'
export { useScrollProgress } from './hooks/useScrollProgress'
export { useLogoTransition } from './hooks/useLogoTransition'
export { useAboutSection } from './hooks/useAboutSection'