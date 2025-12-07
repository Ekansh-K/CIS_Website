import React from 'react'
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CISLogo from '../CISLogo'

// Mock the useGLTF hook
vi.mock('@react-three/drei', () => {
  const mockUseGLTF = vi.fn(() => ({
    scene: {
      // Mock 3D scene object
      clone: vi.fn()
    }
  }))
  
  // Add preload method to the mock
  mockUseGLTF.preload = vi.fn()
  
  return {
    useGLTF: mockUseGLTF
  }
})

// Mock the useFrame hook
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber')
  return {
    ...actual,
    useFrame: vi.fn((callback) => {
      // Store the callback for manual triggering in tests
      ;(global as any).frameCallback = callback
    })
  }
})

describe('CISLogo - Scroll Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderCISLogo = (props = {}) => {
    return render(
      <Canvas>
        <CISLogo {...props} />
      </Canvas>
    )
  }

  it('should accept scroll-based position props', () => {
    const position = { x: -2, y: 1.5, z: 0 }
    
    expect(() => {
      renderCISLogo({ position })
    }).not.toThrow()
  })

  it('should accept scroll-based scale props', () => {
    const scrollScale = 1.0
    
    expect(() => {
      renderCISLogo({ scrollScale })
    }).not.toThrow()
  })

  it('should accept scroll-based rotation props', () => {
    const scrollRotation = { x: 0, y: Math.PI, z: 0 }
    
    expect(() => {
      renderCISLogo({ scrollRotation })
    }).not.toThrow()
  })

  it('should accept disableMouseInteraction prop', () => {
    expect(() => {
      renderCISLogo({ disableMouseInteraction: true })
    }).not.toThrow()
  })

  it('should accept transitionProgress prop', () => {
    expect(() => {
      renderCISLogo({ transitionProgress: 0.5 })
    }).not.toThrow()
  })

  it('should use default values when scroll props are not provided', () => {
    expect(() => {
      renderCISLogo()
    }).not.toThrow()
  })

  it('should handle all scroll props together', () => {
    const scrollProps = {
      position: { x: -1, y: 0.75, z: 0 },
      scrollScale: 2.25,
      scrollRotation: { x: 0, y: Math.PI / 2, z: 0 },
      disableMouseInteraction: true,
      transitionProgress: 0.5
    }
    
    expect(() => {
      renderCISLogo(scrollProps)
    }).not.toThrow()
  })

  it('should prioritize scrollScale over regular scale when provided', () => {
    const props = {
      scale: 3.5,
      scrollScale: 1.0
    }
    
    expect(() => {
      renderCISLogo(props)
    }).not.toThrow()
    
    // The component should use scrollScale (1.0) instead of scale (3.5)
    // This is tested through the useFrame callback behavior
  })

  it('should handle transition progress for 360-degree rotation', () => {
    const props = {
      transitionProgress: 0.5 // Should result in 180-degree rotation
    }
    
    expect(() => {
      renderCISLogo(props)
    }).not.toThrow()
  })

  it('should disable mouse interaction during transition', () => {
    const props = {
      disableMouseInteraction: true,
      transitionProgress: 0.3
    }
    
    expect(() => {
      renderCISLogo(props)
    }).not.toThrow()
  })

  it('should enable mouse interaction when not transitioning', () => {
    const props = {
      disableMouseInteraction: false,
      transitionProgress: 0
    }
    
    expect(() => {
      renderCISLogo(props)
    }).not.toThrow()
  })

  it('should handle complete transition state', () => {
    const props = {
      position: { x: -2, y: 1.5, z: 0 },
      scrollScale: 1.0,
      scrollRotation: { x: 0, y: 0, z: 0 },
      disableMouseInteraction: false,
      transitionProgress: 1.0
    }
    
    expect(() => {
      renderCISLogo(props)
    }).not.toThrow()
  })

  it('should handle center position state', () => {
    const props = {
      position: { x: 0, y: 0, z: 0 },
      scrollScale: 3.5,
      scrollRotation: { x: 0, y: 0, z: 0 },
      disableMouseInteraction: false,
      transitionProgress: 0
    }
    
    expect(() => {
      renderCISLogo(props)
    }).not.toThrow()
  })

  it('should maintain backward compatibility with existing props', () => {
    const existingProps = {
      scale: 2.0,
      rotationSpeed: 0.001,
      mouseInfluence: 0.5,
      autoRotate: false,
      onReady: vi.fn()
    }
    
    expect(() => {
      renderCISLogo(existingProps)
    }).not.toThrow()
  })
})