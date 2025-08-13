import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Lenis from 'lenis'

type IntroPhase = 'loading' | 'animating' | 'complete'

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
  
  // Intro scene actions
  startIntro: () => void
  completeIntro: () => void
  skipIntro: () => void
  setPhase: (phase: IntroPhase) => void
  setUserSkipPreference: (skip: boolean) => void
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