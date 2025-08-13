import { useCallback, useRef, useEffect } from 'react';

interface TransitionEndOptions {
  /**
   * Fallback timeout in milliseconds if transition events don't fire
   * @default 5000
   */
  fallbackTimeout?: number;
  /**
   * Expected number of transition events to wait for
   * @default 1
   */
  expectedTransitions?: number;
  /**
   * Whether to enable event delegation for child elements
   * @default false
   */
  enableDelegation?: boolean;
  /**
   * CSS property names to filter transition events by
   * If provided, only transitions for these properties will be counted
   */
  propertyFilter?: string[];
}

interface TransitionEndCallbacks {
  /**
   * Called when a single transition completes
   */
  onTransition?: (event: TransitionEvent, completedCount: number) => void;
  /**
   * Called when all expected transitions complete
   */
  onAllTransitionsComplete?: () => void;
  /**
   * Called when fallback timeout triggers
   */
  onFallbackTimeout?: () => void;
}

/**
 * Custom hook for handling CSS transition completion events with proper cleanup
 * and fallback mechanisms. Supports event delegation and multiple transition tracking.
 */
const useTransitionEnd = (
  callbacks: TransitionEndCallbacks,
  options: TransitionEndOptions = {}
) => {
  const {
    fallbackTimeout = 5000,
    expectedTransitions = 1,
    enableDelegation = false,
    propertyFilter
  } = options;

  const {
    onTransition,
    onAllTransitionsComplete,
    onFallbackTimeout
  } = callbacks;

  // Refs for tracking state and cleanup
  const completedTransitionsRef = useRef(0);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCompletedRef = useRef(false);
  const activeElementsRef = useRef(new Set<Element>());

  // Reset the transition tracking state
  const reset = useCallback(() => {
    completedTransitionsRef.current = 0;
    isCompletedRef.current = false;
    activeElementsRef.current.clear();
    
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // Handle transition end events
  const handleTransitionEnd = useCallback((event: TransitionEvent) => {
    // Skip if already completed
    if (isCompletedRef.current) {
      return;
    }

    // Filter by property name if specified
    if (propertyFilter && !propertyFilter.includes(event.propertyName)) {
      return;
    }

    // For event delegation, only count transitions from child elements
    // For direct events, only count transitions from the target element itself
    const shouldCount = enableDelegation 
      ? event.target !== event.currentTarget
      : event.target === event.currentTarget;

    if (shouldCount) {
      completedTransitionsRef.current += 1;
      const completedCount = completedTransitionsRef.current;

      // Call single transition callback
      onTransition?.(event, completedCount);

      // Check if all expected transitions are complete
      if (completedCount >= expectedTransitions) {
        isCompletedRef.current = true;
        
        // Clear fallback timer
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }

        // Call completion callback
        onAllTransitionsComplete?.();
      }
    }
  }, [
    enableDelegation,
    expectedTransitions,
    propertyFilter,
    onTransition,
    onAllTransitionsComplete
  ]);

  // Start tracking transitions for an element
  const startTracking = useCallback((element: Element | null) => {
    if (!element || activeElementsRef.current.has(element)) {
      return;
    }

    // Add element to active tracking set
    activeElementsRef.current.add(element);

    // Add transition event listener
    element.addEventListener('transitionend', handleTransitionEnd as EventListener);

    // Start fallback timer if this is the first element being tracked
    if (activeElementsRef.current.size === 1 && !fallbackTimerRef.current) {
      fallbackTimerRef.current = setTimeout(() => {
        if (!isCompletedRef.current) {
          isCompletedRef.current = true;
          onFallbackTimeout?.();
        }
      }, fallbackTimeout);
    }
  }, [handleTransitionEnd, fallbackTimeout, onFallbackTimeout]);

  // Stop tracking transitions for an element
  const stopTracking = useCallback((element: Element | null) => {
    if (!element || !activeElementsRef.current.has(element)) {
      return;
    }

    // Remove element from active tracking set
    activeElementsRef.current.delete(element);

    // Remove transition event listener
    element.removeEventListener('transitionend', handleTransitionEnd as EventListener);
  }, [handleTransitionEnd]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up all active elements
      activeElementsRef.current.forEach(element => {
        element.removeEventListener('transitionend', handleTransitionEnd as EventListener);
      });
      activeElementsRef.current.clear();

      // Clear fallback timer
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [handleTransitionEnd]);

  return {
    /**
     * Start tracking transition events for an element
     */
    startTracking,
    /**
     * Stop tracking transition events for an element
     */
    stopTracking,
    /**
     * Reset the transition tracking state
     */
    reset,
    /**
     * Get the current number of completed transitions
     */
    getCompletedCount: () => completedTransitionsRef.current,
    /**
     * Check if all transitions are complete
     */
    isComplete: () => isCompletedRef.current,
    /**
     * Direct transition end handler for use with React event props
     */
    handleTransitionEnd
  };
};

export default useTransitionEnd;