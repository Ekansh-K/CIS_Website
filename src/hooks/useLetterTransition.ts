import { useCallback, useRef, useState } from 'react';

interface LetterPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

interface LetterTransitionState {
  C: LetterPosition | null;
  I: LetterPosition | null;
  S: LetterPosition | null;
}

export const useLetterTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(false);
  const letterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [letterPositions, setLetterPositions] = useState<LetterTransitionState>({
    C: null,
    I: null,
    S: null
  });

  // Register letter element
  const registerLetter = useCallback((letterId: string, element: HTMLDivElement | null) => {
    letterRefs.current[letterId] = element;
  }, []);

  // Calculate letter positions
  const calculateLetterPosition = useCallback((element: HTMLDivElement): LetterPosition => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      scale: 1
    };
  }, []);

  // Start transition from intro to main page positions
  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    
    // Get current positions of intro letters
    const introPositions: LetterTransitionState = {
      C: null,
      I: null,
      S: null
    };

    ['C', 'I', 'S'].forEach(letter => {
      const introElement = letterRefs.current[`intro-${letter}`];
      const mainElement = letterRefs.current[`main-${letter}`];
      
      if (introElement && mainElement) {
        const introPos = calculateLetterPosition(introElement);
        const mainPos = calculateLetterPosition(mainElement);
        
        // Calculate the transform needed
        const deltaX = mainPos.x - introPos.x;
        const deltaY = mainPos.y - introPos.y;
        const scaleX = mainPos.width / introPos.width;
        const scaleY = mainPos.height / introPos.height;
        
        // Apply transform to intro element to move it to main position
        introElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
        introElement.style.transition = 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Hide main element initially
        mainElement.style.opacity = '0';
      }
    });

    // Complete transition after animation
    setTimeout(() => {
      setTransitionComplete(true);
      setIsTransitioning(false);
      
      // Show main elements and hide intro elements
      ['C', 'I', 'S'].forEach(letter => {
        const introElement = letterRefs.current[`intro-${letter}`];
        const mainElement = letterRefs.current[`main-${letter}`];
        
        if (introElement && mainElement) {
          introElement.style.opacity = '0';
          mainElement.style.opacity = '1';
          mainElement.style.transition = 'opacity 300ms ease-out';
        }
      });
    }, 1000);
  }, [calculateLetterPosition]);

  // Reset transition state
  const resetTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionComplete(false);
    
    // Reset all transforms and opacity
    Object.values(letterRefs.current).forEach(element => {
      if (element) {
        element.style.transform = '';
        element.style.transition = '';
        element.style.opacity = '';
      }
    });
  }, []);

  return {
    isTransitioning,
    transitionComplete,
    registerLetter,
    startTransition,
    resetTransition
  };
};