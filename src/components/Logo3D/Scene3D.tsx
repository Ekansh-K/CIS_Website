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
        {/* Bright lighting setup for better visibility */}
        <ambientLight intensity={0.8} color="#ffffff" />

        {/* Key light - main directional light (brighter) */}
        <directionalLight
          position={[10, 10, 8]}
          intensity={2.5}
          color="#ffffff"
          castShadow
        />

        {/* Fill light - softer light from opposite side (brighter) */}
        <directionalLight
          position={[-8, 5, 6]}
          intensity={1.5}
          color="#f0f8ff"
        />

        {/* Top light - illuminates from above */}
        <directionalLight
          position={[0, 15, 5]}
          intensity={1.2}
          color="#ffffff"
        />

        {/* Rim light - creates edge definition (brighter) */}
        <pointLight
          position={[0, -10, -8]}
          intensity={1.0}
          color="#b3d9ff"
        />

        {/* Accent light - adds blue tint matching theme (brighter) */}
        <pointLight
          position={[15, 0, 5]}
          intensity={0.8}
          color="#60a5fa"
        />

        {/* Additional front light for better visibility - INTENSIFIED */}
        <pointLight
          position={[0, 0, 10]}
          intensity={3.5}
          color="#ffffff"
        />
        
        {/* Extra intense front spotlight for maximum visibility */}
        <spotLight 
          position={[0, 0, 20]} 
          intensity={2.5} 
          color="#ffffff"
          angle={Math.PI / 3}
          penumbra={0.1}
        />
        
        {/* Close-range front illumination array */}
        <pointLight 
          position={[0, 8, 15]} 
          intensity={1.8} 
          color="#f8fafc"
        />
        <pointLight 
          position={[0, -8, 15]} 
          intensity={1.8} 
          color="#f8fafc"
        />
        <pointLight 
          position={[8, 0, 15]} 
          intensity={1.8} 
          color="#f8fafc"
        />
        <pointLight 
          position={[-8, 0, 15]} 
          intensity={1.8} 
          color="#f8fafc"
        />

        {/* Side lights for even illumination */}
        <pointLight
          position={[-15, 5, 0]}
          intensity={1.5}
          color="#e0f2fe"
        />
        <pointLight
          position={[15, -5, 0]}
          intensity={1.5}
          color="#dbeafe"
        />


        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}