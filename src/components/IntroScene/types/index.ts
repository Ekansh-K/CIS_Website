// TypeScript interfaces for IntroScene components and data models

// Main IntroScene component props
export interface IntroSceneProps {
  onComplete: () => void;
  autoStart?: boolean;
  skipOnMobile?: boolean;
}

// BlueOverlay component props
export interface BlueOverlayProps {
  isVisible: boolean;
  onRevealComplete: () => void;
  revealDirection?: 'center' | 'left' | 'right';
}

// Shared Letter component props
export interface LetterProps {
  isVisible: boolean;
  animationDelay: number;
  onAnimationComplete: () => void;
  size?: 'small' | 'medium' | 'large';
}

// Simplified Letter component props for CSS-heavy approach
export interface SimplifiedLetterProps {
  className?: string;
  style?: React.CSSProperties;
  onTransitionEnd?: (event: React.TransitionEvent) => void;
}

// Device detection data model
export interface DeviceInfo {
  isDesktop: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  hasReducedMotion: boolean;
}

// Animation timeline models
export interface AnimationPhase {
  name: string;
  duration: number;
  delay: number;
  easing: string;
  properties: Record<string, any>;
}

export interface IntroTimeline {
  phases: AnimationPhase[];
  totalDuration: number;
  canSkip: boolean;
}

// Intro state management (for Zustand store - will be implemented in task 2)
export interface IntroStore {
  // State
  isIntroActive: boolean;
  isIntroComplete: boolean;
  currentPhase: 'loading' | 'animating' | 'complete';
  isDesktop: boolean;
  
  // Actions
  startIntro: () => void;
  completeIntro: () => void;
  skipIntro: () => void;
  setPhase: (phase: 'loading' | 'animating' | 'complete') => void;
}