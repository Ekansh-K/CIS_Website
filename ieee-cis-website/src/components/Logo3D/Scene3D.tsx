import { Canvas } from '@react-three/fiber'
import React from 'react'
import { Suspense, useState, useCallback } from 'react'

interface ModelBounds {
  width: number
  height: number
  depth: number
  center: { x: number; y: number; z: number }
}

interface Scene3DProps {
  children: React.ReactNode
}

// Three-point lighting calculation based on model bounds
const calculateLightingPositions = (bounds: ModelBounds | null) => {
  if (!bounds) {
    // Default positions when bounds are not available
    return {
      keyLight: [10, 10, 8] as [number, number, number],
      fillLight: [-8, 5, 6] as [number, number, number],
      rimLight: [0, -10, -8] as [number, number, number],
      backLight1: [0, 0, -15] as [number, number, number],
      backLight2: [0, 10, -12] as [number, number, number],
      backLight3: [0, -10, -12] as [number, number, number]
    }
  }

  const { width, height, depth, center } = bounds
  
  // Key Light: Primary light at 45° angle, positioned to illuminate the front-right
  const keyLight: [number, number, number] = [
    center.x + width * 0.6,   // 60% to the right of model
    center.y + height * 0.4,  // 40% above model center
    center.z + depth * 0.8    // 80% in front of model
  ]
  
  // Fill Light: Secondary light to reduce shadows, positioned front-left
  const fillLight: [number, number, number] = [
    center.x - width * 0.4,   // 40% to the left of model
    center.y + height * 0.2,  // 20% above model center
    center.z + depth * 0.6    // 60% in front of model
  ]
  
  // Rim Light: Back light for edge definition and separation
  const rimLight: [number, number, number] = [
    center.x,                 // Centered horizontally
    center.y - height * 0.3,  // 30% below model center
    center.z - depth * 0.5    // 50% behind model
  ]
  
  // Back Lights: Multiple lights behind the model for depth and glow
  const backLight1: [number, number, number] = [
    center.x,                 // Centered horizontally
    center.y,                 // At model center height
    center.z - depth * 1.2    // Far behind model
  ]
  
  const backLight2: [number, number, number] = [
    center.x,                 // Centered horizontally
    center.y + height * 0.5,  // Above model
    center.z - depth * 0.8    // Behind model
  ]
  
  const backLight3: [number, number, number] = [
    center.x,                 // Centered horizontally
    center.y - height * 0.5,  // Below model
    center.z - depth * 0.8    // Behind model
  ]
  
  return { keyLight, fillLight, rimLight, backLight1, backLight2, backLight3 }
}

export default function Scene3D({ children }: Scene3DProps) {
  const [modelBounds, setModelBounds] = useState<ModelBounds | null>(null)
  
  // Callback to receive model bounds from CISLogo component
  const handleBoundsCalculated = useCallback((bounds: ModelBounds) => {
    setModelBounds(bounds)
  }, [])
  
  // Calculate lighting positions based on model bounds
  const lightingPositions = calculateLightingPositions(modelBounds)
  
  return (
    <div className="w-full h-full overflow-visible" style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [0, 0, 400],
          fov: 80
        }}
        gl={{
          antialias: true,
          alpha: true
        }}
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        {/* Ambient Light - Low intensity for global illumination */}
        <ambientLight intensity={0.3} color="#ffffff" />

        {/* KEY LIGHT - Primary directional light (60% of total illumination) */}
        <directionalLight
          position={lightingPositions.keyLight}
          intensity={2.0}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.1}
          shadow-camera-far={1000}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* FILL LIGHT - Secondary light to reduce harsh shadows (30% of total) */}
        <directionalLight
          position={lightingPositions.fillLight}
          intensity={1.0}
          color="#f0f8ff"
        />

        {/* RIM LIGHT - Back light for edge definition (10% of total) */}
        <pointLight
          position={lightingPositions.rimLight}
          intensity={0.6}
          color="#b3d9ff"
          distance={0}
          decay={2}
        />

        {/* BACK LIGHTING SYSTEM - Creates depth and atmospheric glow */}
        
        {/* Main Back Light - Central background illumination */}
        <pointLight
          position={lightingPositions.backLight1}
          intensity={0.8}
          color="#60a5fa"
          distance={0}
          decay={1.5}
        />
        
        {/* Upper Back Light - Creates top glow */}
        <pointLight
          position={lightingPositions.backLight2}
          intensity={0.5}
          color="#93c5fd"
          distance={0}
          decay={2}
        />
        
        {/* Lower Back Light - Creates bottom glow */}
        <pointLight
          position={lightingPositions.backLight3}
          intensity={0.5}
          color="#dbeafe"
          distance={0}
          decay={2}
        />

        <Suspense fallback={null}>
          {React.cloneElement(children as React.ReactElement, {
            onBoundsCalculated: handleBoundsCalculated
          })}
        </Suspense>
      </Canvas>
    </div>
  )
}