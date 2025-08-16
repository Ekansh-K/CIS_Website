import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { Group } from 'three'

interface CISLogoProps {
  scale?: number
  rotationSpeed?: number
  mouseInfluence?: number
  autoRotate?: boolean
  onReady?: () => void
}

export default function CISLogo({
  scale = 1,
  rotationSpeed = 0.002,
  mouseInfluence = 0.75,
  autoRotate = true,
  onReady
}: CISLogoProps) {
  const groupRef = useRef<Group>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [modelReady, setModelReady] = useState(false)

  // Load the GLB model
  const { scene } = useGLTF('/src/assets/models/Cis_Logo.glb')

  // Notify when model is ready
  useEffect(() => {
    if (scene && !modelReady) {
      setModelReady(true)
      onReady?.()
    }
  }, [scene, modelReady, onReady])

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

  // Animation loop - limited mouse-based rotation only
  useFrame(() => {
    if (!groupRef.current) return

    // Base rotation to maintain camera alignment
    const baseRotationX = Math.PI * 0.5 // Keep the base alignment
    const baseRotationZ = 0 // No base Z rotation

    // Limited mouse influence: X-axis max 30 degrees, Z-axis unlimited
    const maxXRotation = Math.PI / 6 // 30 degrees in radians
    const targetRotationX = baseRotationX + Math.max(-maxXRotation, Math.min(maxXRotation, mousePosition.y * mouseInfluence * 0.3))
    const targetRotationZ = baseRotationZ + mousePosition.x * mouseInfluence * 0.3

    // Smooth interpolation (lerp)
    groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.5
    groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 0.5
    // Y-axis rotation is not affected by mouse (stays at auto-rotation or 0)
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