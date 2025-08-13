import { useEffect, useState, useRef } from 'react'
import Logo3D from './components/Logo3D'
import IntroScene from './components/IntroScene/IntroScene'
import { useStore } from './lib/store'
import CSvgUrl from './assets/Icons/C.svg'
import ISvgUrl from './assets/Icons/I.svg'
import SSvgUrl from './assets/Icons/S.svg'
import './App.css'

function App() {
  const setLenis = useStore((state) => state.setLenis)
  const { 
    isIntroComplete, 
    userSkipPreference, 
    startIntro, 
    completeIntro,
    setPhase 
  } = useStore()
  
  const [showMainContent, setShowMainContent] = useState(false)
  const [introTransitionComplete, setIntroTransitionComplete] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const lenisInitialized = useRef(false)

  // Determine if intro should be shown
  const shouldShowIntro = !isIntroComplete && !userSkipPreference

  // Initialize Lenis smooth scroll - only after intro completes
  useEffect(() => {
    if (isIntroComplete && !lenisInitialized.current) {
      const initLenis = async () => {
        const Lenis = (await import('lenis')).default
        
        const lenis = new Lenis({
          lerp: 0.1,
          duration: 1.2,
          orientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        })

        setLenis(lenis)

        function raf(time: number) {
          lenis.raf(time)
          requestAnimationFrame(raf)
        }
        requestAnimationFrame(raf)

        lenisInitialized.current = true

        return () => lenis.destroy()
      }

      initLenis()
    }
  }, [setLenis, isIntroComplete])

  // Handle intro completion with smooth transition
  const handleIntroComplete = () => {
    setPhase('complete')
    completeIntro()
    
    // Small delay to ensure state updates, then show main content
    setTimeout(() => {
      setShowMainContent(true)
      
      // Focus management - move focus to main content for accessibility
      if (mainContentRef.current) {
        mainContentRef.current.focus()
      }
      
      // Mark transition as complete after a brief delay for smooth transition
      setTimeout(() => {
        setIntroTransitionComplete(true)
      }, 300)
    }, 100)
  }

  // Initialize intro on mount if it should be shown
  useEffect(() => {
    if (shouldShowIntro) {
      setPhase('loading')
      startIntro()
    } else {
      // Skip intro - show main content immediately
      setShowMainContent(true)
      setIntroTransitionComplete(true)
      completeIntro()
    }
  }, [shouldShowIntro, setPhase, startIntro, completeIntro])

  return (
    <>
      {/* Intro Scene - Rendered first if needed */}
      {shouldShowIntro && (
        <IntroScene
          onComplete={handleIntroComplete}
          autoStart={true}
          skipOnMobile={true}
        />
      )}

      {/* Main Content - Only rendered after intro completes or is skipped */}
      {showMainContent && (
        <div 
          ref={mainContentRef}
          className={`h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-visible transition-opacity duration-300 ${
            introTransitionComplete ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: '100vw', height: '100vh', minHeight: '100vh' }}
          tabIndex={-1}
          role="main"
          aria-label="IEEE CIS main content"
        >
          {/* CIS Title */}
          <header className="absolute top-8 left-8 z-10">
            <h1 className="text-4xl font-bold text-white">CIS</h1>
          </header>

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

          {/* Content sections (for future development) */}
          <main className="relative z-10 pt-screen">
            <section className="h-screen flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-6xl font-bold mb-4 flex items-center justify-center gap-6">
                  <img 
                    src={CSvgUrl} 
                    alt="Computational" 
                    className="w-48 h-48" 
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                  <img 
                    src={ISvgUrl} 
                    alt="Intelligence" 
                    className="w-48 h-48" 
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                  <img 
                    src={SSvgUrl} 
                    alt="Society" 
                    className="w-48 h-48" 
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </h1>
                <p className="text-xl opacity-80">
                  Advancing the frontiers of computational intelligence
                </p>
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  )
}

export default App
