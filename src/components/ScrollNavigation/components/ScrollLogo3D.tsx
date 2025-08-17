import React from 'react'
import CISLogo from '../../Logo3D/CISLogo'
import { useLogoTransition } from '../hooks/useLogoTransition'

interface ScrollLogo3DProps {
  scrollProgress: number
  targetPosition: 'center' | 'nav'
  onTransitionComplete?: () => void
  className?: string
}

/**
 * ScrollLogo3D Component
 * 
 * Enhanced 3D logo with scroll-based positioning and scaling.
 * Handles smooth transition from center to navigation bar with 360-degree rotation.
 * Disables mouse interaction during transition.
 */
export const ScrollLogo3D: React.FC<ScrollLogo3DProps> = ({
  scrollProgress,
  targetPosition,
  onTransitionComplete,
  className = ''
}) => {
  const logoTransition = useLogoTransition()

  // Call transition complete callback when transition finishes
  React.useEffect(() => {
    if (onTransitionComplete && !logoTransition.isTransitioning && logoTransition.progress > 0.99) {
      onTransitionComplete()
    }
  }, [logoTransition.isTransitioning, logoTransition.progress, onTransitionComplete])

  return (
    <div className={`scroll-logo-3d ${className}`}>
      <CISLogo
        position={logoTransition.position}
        scrollScale={logoTransition.scale}
        scrollRotation={logoTransition.rotation}
        disableMouseInteraction={logoTransition.disableMouseInteraction}
        transitionProgress={logoTransition.transitionRotationY}
        onReady={() => {
          // Logo is ready for transitions
        }}
      />
    </div>
  )
}

export default ScrollLogo3D