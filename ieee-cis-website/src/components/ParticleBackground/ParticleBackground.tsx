import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Particles from '../Particles'

interface ParticleBackgroundProps {
  className?: string
}

export default function ParticleBackground({ className = '' }: ParticleBackgroundProps) {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }} /* Above background but below 3D logo and content */
    >
      <Canvas
        camera={{
          position: [0, 0, 100],
          fov: 75
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          precision: 'highp',
          stencil: false,
          depth: false
        }}
        dpr={[1, 2]} // Support high DPI displays
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <Suspense fallback={null}>
          <Particles
            width={600}
            height={600}
            depth={300}
            count={750}
            scale={40}
            size={1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}