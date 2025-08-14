import { ErrorBoundary } from 'react-error-boundary'
import Scene3D from './Scene3D'
import CISLogo from './CISLogo'

interface Logo3DProps {
  className?: string
  scale?: number
  rotationSpeed?: number
  mouseInfluence?: number
  autoRotate?: boolean
  onReady?: () => void
}

function Logo3DError({ error }: { error: Error }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏛️</div>
        <p className="text-white/70">3D Logo unavailable</p>
        <p className="text-white/50 text-sm mt-2">
          {error.message}
        </p>
      </div>
    </div>
  )
}

export default function Logo3D({
  className = "w-full h-full",
  scale = 1,
  rotationSpeed = 0.002,
  mouseInfluence = 0.75,
  autoRotate = true,
  onReady
}: Logo3DProps) {
  return (
    <div 
      className={`${className} overflow-visible`}
      style={{ width: '100%', height: '100%', minHeight: '100vh' }}
    >
      <ErrorBoundary
        FallbackComponent={Logo3DError}
        onError={(error) => console.error('3D Logo Error:', error)}
      >
        <Scene3D>
          <CISLogo
            scale={scale}
            rotationSpeed={rotationSpeed}
            mouseInfluence={mouseInfluence}
            autoRotate={autoRotate}
            onReady={onReady}
          />
        </Scene3D>
      </ErrorBoundary>
    </div>
  )
}