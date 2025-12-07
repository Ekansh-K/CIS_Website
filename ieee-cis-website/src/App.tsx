import { useEffect, useState, useRef } from 'react'
import Logo3D from './components/Logo3D'
import IntroScene from './components/IntroScene/IntroScene'
import ParticleBackground from './components/ParticleBackground'
import ScrollNavigation, { AboutSection } from './components/ScrollNavigation'
import TeamSection from './components/ScrollNavigation/components/TeamSection'
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

  const [introTransitionComplete, setIntroTransitionComplete] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const lenisInitialized = useRef(false)

  // Letter transition management (commented out for now)
  // const letterTransition = useLetterTransition()

  // Determine if intro should be shown
  const shouldShowIntro = !isIntroComplete && !userSkipPreference



  // Initialize Lenis smooth scroll - immediately for testing
  useEffect(() => {
    if (!lenisInitialized.current) {
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
  }, [setLenis])



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
        className="min-h-screen bg-gradient-to-t from-blue-900 to-black"
        tabIndex={-1}
        role="main"
        aria-label="IEEE CIS main content"
      >
        {/* Advanced Particle System Background */}
        <ParticleBackground />

        {/* 3D Logo - First section background */}
        <div
          className="absolute inset-0 h-screen"
          style={{ width: '100%', height: '100vh', zIndex: 10 }}
        >
          <Logo3D
            className="w-screen h-screen"
            scale={3.5}
            rotationSpeed={0.002}
            mouseInfluence={0.75}
            autoRotate={false}

          />
        </div>

        {/* Content sections */}
        <main className="relative z-10">
          {/* Hero section with 3D logo */}
          <section className="h-screen flex items-center justify-center relative">
            <div className="text-center text-white relative z-20">
              <h1 className="text-6xl font-bold mb-4 flex items-center justify-center gap-6">
                <img
                  src={CSvgUrl}
                  alt="Computational"
                  className="w-16 h-16 md:w-70 md:h-70"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <img
                  src={ISvgUrl}
                  alt="Intelligence"
                  className="w-16 h-16 md:w-70 md:h-70"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <img
                  src={SSvgUrl}
                  alt="Society"
                  className="w-16 h-16 md:w-70 md:h-70"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </h1>
              <p className="text-xl opacity-80">
                Advancing the frontiers of computational intelligence
              </p>
            </div>
          </section>

          {/* Spacer section for logo transition - reduced by 40% */}
          <section className="h-[60vh] bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
            {/* Empty space to allow logo transition time */}
          </section>

          {/* About section with Lenis-inspired sticky layout */}
          <AboutSection />

          {/* Team section with horizontal scrolling cards */}
          <TeamSection />
        </main>
      </div>

      {/* Scroll Navigation - Appears after intro */}
      <ScrollNavigation />

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
