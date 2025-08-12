import Logo3D from './components/Logo3D'
import './App.css'

function App() {
  return (
    <div 
      className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-visible"
      style={{ width: '100vw', height: '100vh', minHeight: '100vh' }}
    >
      {/* 3D Logo - Full screen background */}
      <div 
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Logo3D
          className="w-screen h-screen"
          scale={5}
          rotationSpeed={0.002}
          mouseInfluence={0.75}
          autoRotate={true}
        />
      </div>
    </div>
  )
}

export default App
