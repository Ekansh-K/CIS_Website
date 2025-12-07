// Animation timeline definitions - will be implemented in later tasks

interface AnimationPhase {
  name: string;
  duration: number;
  delay: number;
  easing: string;
  properties: Record<string, any>;
}

interface IntroTimeline {
  phases: AnimationPhase[];
  totalDuration: number;
  canSkip: boolean;
}

// Placeholder for GSAP timeline definitions
export const createIntroTimeline = (): IntroTimeline => {
  return {
    phases: [],
    totalDuration: 0,
    canSkip: true,
  };
};

export type { AnimationPhase, IntroTimeline };