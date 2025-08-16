import { useEffect, useState, useRef, useCallback } from 'react'
import Logo3D from './components/Logo3D'
import IntroScene from './components/IntroScene/IntroScene'
import ParticleBackground from './components/ParticleBackground'
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

  const [showMainContent, setShowMainContent] = useState(true) // Always render main content
  const [introTransitionComplete, setIntroTransitionComplete] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [mainContentReady, setMainContentReady] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const lenisInitialized = useRef(false)

  // Letter transition management (commented out for now)
  // const letterTransition = useLetterTransition()

  // Determine if intro should be shown
  const shouldShowIntro = !isIntroComplete && !userSkipPreference

  // Asset preloading during intro
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Preload 3D model
        const { useGLTF } = await import('@react-three/drei')
        await useGLTF.preload('/src/assets/models/Cis_Logo.glb')

        // Preload SVG icons
        const svgPromises = [
          new Promise(resolve => {
            const img = new Image()
            img.onload = img.onerror = resolve
            img.src = CSvgUrl
          }),
          new Promise(resolve => {
            const img = new Image()
            img.onload = img.onerror = resolve
            img.src = ISvgUrl
          }),
          new Promise(resolve => {
            const img = new Image()
            img.onload = img.onerror = resolve
            img.src = SSvgUrl
          })
        ]

        await Promise.allSettled(svgPromises)
        setAssetsLoaded(true)
      } catch (error) {
        console.warn('Asset preloading failed:', error)
        setAssetsLoaded(true) // Continue anyway
      }
    }

    // Start preloading immediately
    preloadAssets()
  }, [])

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

  // Track when main content (3D scene) is ready
  const handleMainContentReady = useCallback(() => {
    setMainContentReady(true)
  }, [])

  // Handle letter transition from intro to main page (commented out)
  // const handleLetterTransition = useCallback(() => {
  //   // Start the letter transition animation
  //   letterTransition.startTransition()
  //   
  //   // Complete the intro after letter transition
  //   setTimeout(() => {
  //     setPhase('complete')
  //     completeIntro()
  //     setIntroTransitionComplete(true)
  //     
  //     // Focus management - move focus to main content for accessibility
  //     if (mainContentRef.current) {
  //       mainContentRef.current.focus()
  //     }
  //   }, 1200) // Wait for letter transition to complete
  // }, [letterTransition, setPhase, completeIntro])

  // Handle intro completion - just focus management since main content is always visible
  const handleIntroComplete = () => {
    setPhase('complete')
    completeIntro()
    setIntroTransitionComplete(true)

    // Focus management - move focus to main content for accessibility
    if (mainContentRef.current) {
      mainContentRef.current.focus()
    }
  }

  // Initialize intro on mount if it should be shown
  useEffect(() => {
    if (shouldShowIntro) {
      setPhase('loading')
      startIntro()
    } else {
      // Skip intro - main content is already visible
      setIntroTransitionComplete(true)
      completeIntro()
    }
  }, [shouldShowIntro, setPhase, startIntro, completeIntro])

  return (
    <>
      {/* Background Layer - Always rendered and visible behind intro */}
      <div
        ref={mainContentRef}
        className="fixed inset-0 bg-gradient-to-t from-blue-900 via-blue-900 to-black z-0"
        style={{ width: '100vw', height: '100vh', minHeight: '100vh' }}
        tabIndex={-1}
        role="main"
        aria-label="IEEE CIS main content"
      >
        {/* Advanced Particle System Background */}
        <ParticleBackground />

        {/* 3D Logo - Full screen background */}
        <div
          className="absolute inset-0 z-2"
          style={{ width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Logo3D
            className="w-screen h-screen"
            scale={3.5}
            rotationSpeed={0.002}
            mouseInfluence={0.75}
            autoRotate={false}
            onReady={handleMainContentReady}
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
                  className="w-70 h-70"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <img
                  src={ISvgUrl}
                  alt="Intelligence"
                  className="w-70 h-70"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <img
                  src={SSvgUrl}
                  alt="Society"
                  className="w-70 h-70"
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

      {/* Intro Layer - On top during intro */}
      {shouldShowIntro && (
        <IntroScene
          onComplete={handleIntroComplete}
          autoStart={true}
          skipOnMobile={true}
        />
      )}
    </>
  )
}

export default App
