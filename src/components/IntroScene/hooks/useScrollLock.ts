import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../../lib/store';

interface UseScrollLockOptions {
  /**
   * Whether to lock scroll immediately when hook is initialized
   * @default false
   */
  lockOnMount?: boolean;
  
  /**
   * Whether to restore scroll position after unlocking
   * @default true
   */
  restorePosition?: boolean;
  
  /**
   * Whether to prevent wheel events during lock
   * @default true
   */
  preventWheelEvents?: boolean;
  
  /**
   * Whether to prevent touch events during lock
   * @default true
   */
  preventTouchEvents?: boolean;
}

interface ScrollLockState {
  isLocked: boolean;
  originalScrollY: number;
  originalOverflow: string;
  originalPosition: string;
  originalTop: string;
  originalWidth: string;
}

/**
 * Custom hook for managing scroll lock during intro animation
 * Handles body scroll prevention, Lenis pause/resume, and scroll position restoration
 */
export const useScrollLock = (options: UseScrollLockOptions = {}) => {
  const {
    lockOnMount = false,
    restorePosition = true,
    preventWheelEvents = true,
    preventTouchEvents = true
  } = options;

  const lenis = useStore((state) => state.lenis);
  const scrollLockState = useRef<ScrollLockState>({
    isLocked: false,
    originalScrollY: 0,
    originalOverflow: '',
    originalPosition: '',
    originalTop: '',
    originalWidth: ''
  });

  // Event handlers for preventing scroll events
  const preventScroll = useCallback((event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const preventTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault();
  }, []);

  /**
   * Lock scroll by applying CSS styles and pausing Lenis
   */
  const lockScroll = useCallback(() => {
    if (scrollLockState.current.isLocked) {
      return; // Already locked
    }

    const body = document.body;
    const scrollY = window.scrollY;

    // Store original values
    scrollLockState.current = {
      isLocked: true,
      originalScrollY: scrollY,
      originalOverflow: body.style.overflow,
      originalPosition: body.style.position,
      originalTop: body.style.top,
      originalWidth: body.style.width
    };

    // Apply scroll lock styles
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    // Pause Lenis if available
    if (lenis) {
      lenis.stop();
    }

    // Add event listeners to prevent scroll events
    if (preventWheelEvents) {
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('DOMMouseScroll', preventScroll, { passive: false });
    }

    if (preventTouchEvents) {
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
    }

    // Prevent keyboard scrolling
    document.addEventListener('keydown', handleKeyDown, { passive: false });

  }, [lenis, preventScroll, preventTouchMove, preventWheelEvents, preventTouchEvents]);

  /**
   * Unlock scroll by restoring CSS styles and resuming Lenis
   */
  const unlockScroll = useCallback(() => {
    if (!scrollLockState.current.isLocked) {
      return; // Not locked
    }

    const body = document.body;
    const state = scrollLockState.current;

    // Restore original styles
    body.style.overflow = state.originalOverflow;
    body.style.position = state.originalPosition;
    body.style.top = state.originalTop;
    body.style.width = state.originalWidth;

    // Restore scroll position if requested
    if (restorePosition) {
      try {
        window.scrollTo(0, state.originalScrollY);
      } catch (error) {
        // Handle test environment where scrollTo might not be implemented
        console.warn('scrollTo not available:', error);
      }
    }

    // Resume Lenis if available
    if (lenis) {
      lenis.start();
    }

    // Remove event listeners
    if (preventWheelEvents) {
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('DOMMouseScroll', preventScroll);
    }

    if (preventTouchEvents) {
      document.removeEventListener('touchmove', preventTouchMove);
    }

    document.removeEventListener('keydown', handleKeyDown);

    // Reset state
    scrollLockState.current.isLocked = false;

  }, [lenis, restorePosition, preventScroll, preventTouchMove, preventWheelEvents, preventTouchEvents]);

  /**
   * Handle keyboard events that could cause scrolling
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const scrollKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', 'Space'
    ];

    if (scrollKeys.includes(event.key)) {
      // Allow Escape key for skipping intro
      if (event.key !== 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, []);

  /**
   * Toggle scroll lock state
   */
  const toggleScrollLock = useCallback(() => {
    if (scrollLockState.current.isLocked) {
      unlockScroll();
    } else {
      lockScroll();
    }
  }, [lockScroll, unlockScroll]);

  // Lock scroll on mount if requested
  useEffect(() => {
    if (lockOnMount) {
      lockScroll();
    }

    // Cleanup on unmount
    return () => {
      if (scrollLockState.current.isLocked) {
        unlockScroll();
      }
    };
  }, [lockOnMount, lockScroll, unlockScroll]);

  return {
    isLocked: scrollLockState.current.isLocked,
    lockScroll,
    unlockScroll,
    toggleScrollLock
  };
};

export default useScrollLock;