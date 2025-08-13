import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Group } from 'three'

interface CISLogoProps {
  scale?: number
  rotationSpeed?: number
  mouseInfluence?: number
  autoRotate?: boolean
}

export default function CISLogo({
  scale = 1,
  rotationSpeed = 0.002,
  mouseInfluence = 0.75,
  autoRotate = true
}: CISLogoProps) {
  const groupRef = useRef<Group>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Load the GLB model
  const { scene } = useGLTF('/src/assets/models/Cis_Logo.glb')

  // Animation loop
  useFrame(() => {
    if (!groupRef.current) return

    if (autoRotate) {
      groupRef.current.rotation.y += rotationSpeed
    }

    // Mouse-based rotation
    const targetRotationX = mousePosition.y * mouseInfluence
    const targetRotationY = mousePosition.x * mouseInfluence

    // Smooth interpolation (lerp)
    groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1
    groupRef.current.rotation.z += (targetRotationY - groupRef.current.rotation.z) * 0.1
  })

  // Handle mouse movement
  const handlePointerMove = (event: any) => {
    const x = (event.point.x / window.innerWidth) * 2 - 1
    const y = -(event.point.y / window.innerHeight) * 2 + 1
    setMousePosition({ x, y })
  }

  return (
    <group
      ref={groupRef}
      scale={[scale, scale, scale]}
      position={[0, 0, 0]}
      rotation={[Math.PI*0.5, Math.PI*0.5, 0]} // 180-degree rotation around X-axis (upside down)
      onPointerMove={handlePointerMove}
    >
      <primitive object={scene} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/src/assets/models/Cis_Logo.glb')