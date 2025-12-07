import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScrollLogo3D } from '../ScrollLogo3D'
import { useLogoTransition } from '../../hooks/useLogoTransition'

// Mock the useLogoTransition hook
vi.mock('../../hooks/useLogoTransition')

// Mock the CISLogo component
vi.mock('../../../Logo3D/CISLogo', () => ({
  default: ({ 
    position, 
    scrollScale, 
    scrollRotation, 
    disableMouseInteraction, 
    transitionProgress,
    onReady 
  }: any) => (
    <div 
      data-testid="cis-logo"
      data-position={JSON.stringify(position)}
      data-scroll-scale={scrollScale}
      data-scroll-rotation={JSON.stringify(scrollRotation)}
      data-disable-mouse={disableMouseInteraction}
      data-transition-progress={transitionProgress}
    >
      CISLogo Mock
    </div>
  )
}))

describe('ScrollLogo3D', () => {
  const mockLogoTransition = {
    position: { x: -1, y: 0.75, z: 0 },
    scale: 2.25,
    rotation: { x: 0, y: 0, z: 0 },
    progress: 0.5,
    isTransitioning: true,
    disableMouseInteraction: true,
    transitionRotationY: 0.5
  }

  beforeEach(() => {
    vi.mocked(useLogoTransition).mockReturnValue(mockLogoTransition)
  })

  it('should render ScrollLogo3D component', () => {
    render(
      <ScrollLogo3D 
        scrollProgress={0.5} 
        targetPosition="nav" 
      />
    )

    expect(screen.getByTestId('cis-logo')).toBeInTheDocument()
    expect(screen.getByText('CISLogo Mock')).toBeInTheDocument()
  })

  it('should pass correct props to CISLogo component', () => {
    render(
      <ScrollLogo3D 
        scrollProgress={0.5} 
        targetPosition="nav" 
      />
    )

    const cisLogo = screen.getByTestId('cis-logo')
    
    expect(cisLogo).toHaveAttribute('data-position', JSON.stringify({ x: -1, y: 0.75, z: 0 }))
    expect(cisLogo).toHaveAttribute('data-scroll-scale', '2.25')
    expect(cisLogo).toHaveAttribute('data-scroll-rotation', JSON.stringify({ x: 0, y: 0, z: 0 }))
    expect(cisLogo).toHaveAttribute('data-disable-mouse', 'true')
    expect(cisLogo).toHaveAttribute('data-transition-progress', '0.5')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ScrollLogo3D 
        scrollProgress={0.5} 
        targetPosition="nav" 
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('scroll-logo-3d', 'custom-class')
  })

  it('should call onTransitionComplete when transition finishes', () => {
    const onTransitionComplete = vi.fn()
    
    // Mock transition complete state
    const completeTransition = {
      ...mockLogoTransition,
      isTransitioning: false,
      progress: 1
    }
    
    vi.mocked(useLogoTransition).mockReturnValue(completeTransition)

    render(
      <ScrollLogo3D 
        scrollProgress={1} 
        targetPosition="nav" 
        onTransitionComplete={onTransitionComplete}
      />
    )

    expect(onTransitionComplete).toHaveBeenCalledTimes(1)
  })

  it('should not call onTransitionComplete when transition is still active', () => {
    const onTransitionComplete = vi.fn()
    
    render(
      <ScrollLogo3D 
        scrollProgress={0.5} 
        targetPosition="nav" 
        onTransitionComplete={onTransitionComplete}
      />
    )

    expect(onTransitionComplete).not.toHaveBeenCalled()
  })

  it('should not call onTransitionComplete when progress is not complete', () => {
    const onTransitionComplete = vi.fn()
    
    // Mock transition not complete state
    const incompleteTransition = {
      ...mockLogoTransition,
      isTransitioning: false,
      progress: 0.8 // Less than 0.99
    }
    
    vi.mocked(useLogoTransition).mockReturnValue(incompleteTransition)

    render(
      <ScrollLogo3D 
        scrollProgress={0.8} 
        targetPosition="nav" 
        onTransitionComplete={onTransitionComplete}
      />
    )

    expect(onTransitionComplete).not.toHaveBeenCalled()
  })

  it('should handle center target position', () => {
    const centerTransition = {
      ...mockLogoTransition,
      position: { x: 0, y: 0, z: 0 },
      scale: 3.5,
      progress: 0,
      isTransitioning: false,
      disableMouseInteraction: false,
      transitionRotationY: 0
    }
    
    vi.mocked(useLogoTransition).mockReturnValue(centerTransition)

    render(
      <ScrollLogo3D 
        scrollProgress={0} 
        targetPosition="center" 
      />
    )

    const cisLogo = screen.getByTestId('cis-logo')
    
    expect(cisLogo).toHaveAttribute('data-position', JSON.stringify({ x: 0, y: 0, z: 0 }))
    expect(cisLogo).toHaveAttribute('data-scroll-scale', '3.5')
    expect(cisLogo).toHaveAttribute('data-disable-mouse', 'false')
    expect(cisLogo).toHaveAttribute('data-transition-progress', '0')
  })

  it('should handle nav target position', () => {
    const navTransition = {
      ...mockLogoTransition,
      position: { x: -2, y: 1.5, z: 0 },
      scale: 1.0,
      progress: 1,
      isTransitioning: false,
      disableMouseInteraction: false,
      transitionRotationY: 1
    }
    
    vi.mocked(useLogoTransition).mockReturnValue(navTransition)

    render(
      <ScrollLogo3D 
        scrollProgress={1} 
        targetPosition="nav" 
      />
    )

    const cisLogo = screen.getByTestId('cis-logo')
    
    expect(cisLogo).toHaveAttribute('data-position', JSON.stringify({ x: -2, y: 1.5, z: 0 }))
    expect(cisLogo).toHaveAttribute('data-scroll-scale', '1')
    expect(cisLogo).toHaveAttribute('data-disable-mouse', 'false')
    expect(cisLogo).toHaveAttribute('data-transition-progress', '1')
  })
})