import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Lenis from 'lenis'

type IntroPhase = 'loading' | 'animating' | 'complete'
type ActiveSection = 'hero' | 'about' | 'team'
type LogoPosition = 'center' | 'transitioning' | 'nav'

interface LogoTransitionState {
  position: LogoPosition
  scale: number
  progress: number
}

interface AboutState {
  pointsRevealed: number
  showContent: boolean
  activePoint: number
}

interface Store {
  // Lenis smooth scroll instance
  lenis: Lenis | undefined
  setLenis: (lenis: Lenis) => void

  // Loading states
  isLoaded: boolean
  setIsLoaded: (isLoaded: boolean) => void

  // Scroll control
  scrollEnabled: boolean
  setScrollEnabled: (scrollEnabled: boolean) => void

  // Navigation state
  navIsOpen: boolean
  setNavIsOpen: (toggle: boolean) => void

  // Overflow control
  overflow: boolean
  setOverflow: (overflow: boolean) => void

  // Scroll thresholds for animations
  thresholds: Record<string, number>
  addThreshold: ({ id, value }: { id: string; value: number }) => void

  // Intro scene state management
  isIntroActive: boolean
  isIntroComplete: boolean
  currentPhase: IntroPhase
  userSkipPreference: boolean
  
  // Scroll state management
  scrollProgress: number
  isScrolling: boolean
  showNavigation: boolean
  activeSection: ActiveSection
  logoTransition: LogoTransitionState
  aboutState: AboutState
  
  // Intro scene actions
  startIntro: () => void
  completeIntro: () => void
  skipIntro: () => void
  setPhase: (phase: IntroPhase) => void
  setUserSkipPreference: (skip: boolean) => void
  
  // Scroll actions
  updateScrollProgress: (progress: number) => void
  setIsScrolling: (isScrolling: boolean) => void
  setShowNavigation: (show: boolean) => void
  setActiveSection: (section: ActiveSection) => void
  setLogoTransition: (transition: Partial<LogoTransitionState>) => void
  setAboutState: (state: Partial<AboutState>) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Lenis instance
      lenis: undefined,
      setLenis: (lenis) => set({ lenis }),

      // Loading states
      isLoaded: false,
      setIsLoaded: (isLoaded) => set({ isLoaded }),

      // Scroll control
      scrollEnabled: false,
      setScrollEnabled: (scrollEnabled) => set({ scrollEnabled }),

      // Navigation state
      navIsOpen: false,
      setNavIsOpen: (toggle) => set({ navIsOpen: toggle }),

      // Overflow control
      overflow: true,
      setOverflow: (overflow) => set({ overflow }),

      // Scroll thresholds for animations
      thresholds: {},
      addThreshold: ({ id, value }) => {
        let thresholds = { ...get().thresholds }
        thresholds[id] = value
        set({ thresholds })
      },

      // Intro scene state management
      isIntroActive: false,
      isIntroComplete: false,
      currentPhase: 'loading' as IntroPhase,
      userSkipPreference: false,

      // Scroll state management
      scrollProgress: 0,
      isScrolling: false,
      showNavigation: false,
      activeSection: 'hero' as ActiveSection,
      logoTransition: {
        position: 'center' as LogoPosition,
        scale: 3.5,
        progress: 0
      },
      aboutState: {
        pointsRevealed: 0,
        showContent: false,
        activePoint: -1
      },

      // Intro scene actions
      startIntro: () => {
        set({ 
          isIntroActive: true, 
          isIntroComplete: false, 
          currentPhase: 'animating' 
        })
      },

      completeIntro: () => {
        set({ 
          isIntroActive: false, 
          isIntroComplete: true, 
          currentPhase: 'complete' 
        })
      },

      skipIntro: () => {
        set({ 
          isIntroActive: false, 
          isIntroComplete: true, 
          currentPhase: 'complete',
          userSkipPreference: true
        })
      },

      setPhase: (phase: IntroPhase) => {
        set({ currentPhase: phase })
      },

      setUserSkipPreference: (skip: boolean) => {
        set({ userSkipPreference: skip })
      },

      // Scroll actions
      updateScrollProgress: (progress: number) => {
        set({ scrollProgress: progress })
      },

      setIsScrolling: (isScrolling: boolean) => {
        set({ isScrolling })
      },

      setShowNavigation: (show: boolean) => {
        set({ showNavigation: show })
      },

      setActiveSection: (section: ActiveSection) => {
        set({ activeSection: section })
      },

      setLogoTransition: (transition: Partial<LogoTransitionState>) => {
        set((state) => ({
          logoTransition: { ...state.logoTransition, ...transition }
        }))
      },

      setAboutState: (aboutStateUpdate: Partial<AboutState>) => {
        set((state) => ({
          aboutState: { ...state.aboutState, ...aboutStateUpdate }
        }))
      },
    }),
    {
      name: 'ieee-cis-store',
      // Only persist user preferences, not runtime state
      partialize: (state) => ({ 
        userSkipPreference: state.userSkipPreference 
      }),
    }
  )
)