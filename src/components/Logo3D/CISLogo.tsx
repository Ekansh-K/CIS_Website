import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { Group, Box3, Vector3 } from 'three'

interface ModelBounds {
  width: number
  height: number
  depth: number
  center: { x: number; y: number; z: number }
}

interface CISLogoProps {
  scale?: number
  rotationSpeed?: number
  mouseInfluence?: number
  autoRotate?: boolean
  onReady?: () => void
  onBoundsCalculated?: (bounds: ModelBounds) => void
  // Scroll-based positioning and scaling props
  position?: { x: number; y: number; z: number }
  scrollScale?: number
  scrollRotation?: { x: number; y: number; z: number }
  disableMouseInteraction?: boolean
  transitionProgress?: number
}

export default function CISLogo({
  scale = 1,
  rotationSpeed = 0.002,
  mouseInfluence = 0.75,
  autoRotate = true,
  onReady,
  onBoundsCalculated,
  position = { x: 0, y: 0, z: 0 },
  scrollScale,
  scrollRotation = { x: 0, y: 0, z: 0 },
  disableMouseInteraction = false,
  transitionProgress = 0
}: CISLogoProps) {
  const groupRef = useRef<Group>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [modelReady, setModelReady] = useState(false)

  // Load the GLB model
  const { scene } = useGLTF('/src/assets/models/Cis_Logo.glb')

  // Calculate model bounds and notify when model is ready
  useEffect(() => {
    if (scene && !modelReady) {
      // Calculate model bounds
      const box = new Box3().setFromObject(scene)
      const size = box.getSize(new Vector3())
      const center = box.getCenter(new Vector3())
      
      // Account for current scale
      const currentScale = scrollScale !== undefined ? scrollScale : scale
      const scaledBounds: ModelBounds = {
        width: size.x * currentScale,
        height: size.y * currentScale,
        depth: size.z * currentScale,
        center: {
          x: center.x * currentScale,
          y: center.y * currentScale,
          z: center.z * currentScale
        }
      }
      
      console.log('Model bounds calculated:', {
        originalSize: { x: size.x, y: size.y, z: size.z },
        scaledBounds,
        scale: currentScale
      })
      
      setModelReady(true)
      onReady?.()
      onBoundsCalculated?.(scaledBounds)
    }
  }, [scene, modelReady, onReady, onBoundsCalculated, scale, scrollScale])

  // Global mouse listener as fallback
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      // Convert screen coordinates to normalized coordinates (-1 to 1)
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      
      // Set mouse position for limited rotation
      setMousePosition({ x: x * 0.8, y: y * 0.8 }) // Reduced sensitivity
    }

    // Add global mouse listener
    window.addEventListener('mousemove', handleGlobalMouseMove)
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [])

  // Animation loop - handles both mouse interaction and scroll-based transitions
  useFrame(() => {
    if (!groupRef.current) return

    // Use scroll scale if provided, otherwise use regular scale
    const currentScale = scrollScale !== undefined ? scrollScale : scale
    groupRef.current.scale.set(currentScale, currentScale, currentScale)

    // Update position based on scroll
    groupRef.current.position.set(position.x, position.y, position.z)

    // Base rotation to maintain camera alignment
    const baseRotationX = Math.PI * 0.5 // Keep the base alignment
    const baseRotationZ = 0 // No base Z rotation

    // Add 360-degree rotation during transition (full rotation = 2 * Math.PI)
    const transitionRotationY = transitionProgress * Math.PI * 2 // 360 degrees

    // Mouse interaction (disabled during transition)
    if (!disableMouseInteraction && transitionProgress === 0) {
      // Limited mouse influence: X-axis max 30 degrees, Z-axis unlimited
      const maxXRotation = Math.PI / 6 // 30 degrees in radians
      const targetRotationX = baseRotationX + Math.max(-maxXRotation, Math.min(maxXRotation, mousePosition.y * mouseInfluence * 0.3))
      const targetRotationZ = baseRotationZ + mousePosition.x * mouseInfluence * 0.3

      // Smooth interpolation (lerp)
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.5
      groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 0.5
      groupRef.current.rotation.y = scrollRotation.y
    } else {
      // During transition or when mouse interaction is disabled
      groupRef.current.rotation.x = baseRotationX + scrollRotation.x
      groupRef.current.rotation.y = scrollRotation.y + transitionRotationY
      groupRef.current.rotation.z = baseRotationZ + scrollRotation.z
    }
  })

  // Handle mouse movement - limited to X and Z axis rotation
  const handlePointerMove = (event: any) => {
    // Convert screen coordinates to normalized coordinates (-1 to 1)
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // Set mouse position for limited rotation
    setMousePosition({ x: x * 0.5, y: y * 0.5 }) // Reduced sensitivity
  }

  return (
    <group
      ref={groupRef}
      scale={[scale, scale, scale]}
      position={[0, 0, 0]}
      rotation={[Math.PI*0.5 , 0, 0]} // Static rotation - face camera directly with slight downward tilt
      onPointerMove={handlePointerMove}
    >
      <primitive object={scene} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/src/assets/models/Cis_Logo.glb')