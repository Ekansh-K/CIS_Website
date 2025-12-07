import { useStore } from '../../../lib/store'

/**
 * Custom hook for intro scene state management
 * Provides easy access to intro-related state and actions
 */
export const useIntroStore = () => {
  const {
    isIntroActive,
    isIntroComplete,
    currentPhase,
    userSkipPreference,
    startIntro,
    completeIntro,
    skipIntro,
    setPhase,
    setUserSkipPreference,
  } = useStore()

  return {
    // State
    isIntroActive,
    isIntroComplete,
    currentPhase,
    userSkipPreference,
    
    // Actions
    startIntro,
    completeIntro,
    skipIntro,
    setPhase,
    setUserSkipPreference,
    
    // Computed values
    shouldShowIntro: !userSkipPreference && !isIntroComplete,
    isIntroInProgress: isIntroActive && currentPhase === 'animating',
  }
}