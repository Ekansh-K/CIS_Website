import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

interface Scene3DProps {
  children: React.ReactNode
}

export default function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="w-full h-full overflow-visible" style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ 
          position: [0, 0, 600], 
          fov: 100 
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
        {/* Basic lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={2} 
          castShadow 
        />
        <pointLight 
          position={[-10, -10, -5]} 
          intensity={0.3} 
        />
        
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}