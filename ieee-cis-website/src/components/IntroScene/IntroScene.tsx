import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDeviceDetection, useTransitionEnd, useScrollLock } from './hooks';
import SharedLetter from '../shared/SharedLetter';
import type { IntroSceneProps } from './types';
import styles from './styles/intro.module.scss';
import CSvgUrl from '../../assets/Icons/C.svg';
import ISvgUrl from '../../assets/Icons/I.svg';
import SSvgUrl from '../../assets/Icons/S.svg';

const IntroScene: React.FC<IntroSceneProps> = ({
  onComplete,
  autoStart = true,
  skipOnMobile = true
}) => {
  const deviceInfo = useDeviceDetection();
  const [showLetters, setShowLetters] = useState(false);
  const [exit, setExit] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expectedTransitions = 3; // C, I, S letters

  // Initialize scroll lock with options
  const { lockScroll, unlockScroll, isLocked } = useScrollLock({
    lockOnMount: false, // We'll lock manually when intro starts
    restorePosition: true,
    preventWheelEvents: true,
    preventTouchEvents: true
  });

  // Configure transition end hook for letter entrance animations
  const letterTransitions = useTransitionEnd(
    {
      onTransition: (event, completedCount) => {
        // Optional: Log transition progress for debugging
        console.debug(`Letter transition ${completedCount}/${expectedTransitions} completed:`, event.propertyName);
      },
      onAllTransitionsComplete: () => {
        // All letters have completed their entrance transitions
        if (!exit && !exitTimerRef.current) {
          // Start exit timer after hold time (1000ms)
          exitTimerRef.current = setTimeout(() => {
            setExit(true);
          }, 1000); // Hold time before exit - reduced by 500ms
        }
      },
      onFallbackTimeout: () => {
        // Fallback: proceed to exit if transitions don't complete
        console.warn('Letter transitions timed out, proceeding to exit');
        if (!exit && !exitTimerRef.current) {
          exitTimerRef.current = setTimeout(() => {
            setExit(true);
          }, 100); // Quick exit on timeout
        }
      }
    },
    {
      expectedTransitions,
      enableDelegation: true,
      propertyFilter: ['transform', 'opacity'], // Only count transform and opacity transitions
      fallbackTimeout: 3000 // 3 second fallback for letter animations
    }
  );

  // Configure transition end hook for exit animation
  const exitTransitions = useTransitionEnd(
    {
      onAllTransitionsComplete: () => {
        // Exit animation completed, unlock scroll and call onComplete
        unlockScroll();
        onComplete();
      },
      onFallbackTimeout: () => {
        // Fallback: complete intro if exit transition doesn't fire
        console.warn('Exit transition timed out, completing intro');
        unlockScroll();
        onComplete();
      }
    },
    {
      expectedTransitions: 1,
      enableDelegation: false,
      propertyFilter: ['transform'],
      fallbackTimeout: 2000 // 2 second fallback for exit animation
    }
  );

  // Skip intro on mobile devices if skipOnMobile is true
  if (skipOnMobile && deviceInfo.isMobile) {
    React.useEffect(() => {
      // Ensure scroll is unlocked before completing
      unlockScroll();
      onComplete();
    }, [onComplete, unlockScroll]);

    return null;
  }

  // Skip intro if user has reduced motion preference
  if (deviceInfo.hasReducedMotion) {
    React.useEffect(() => {
      // Ensure scroll is unlocked before completing
      unlockScroll();
      onComplete();
    }, [onComplete, unlockScroll]);

    return null;
  }

  // Handle skip functionality
  const handleSkip = useCallback(() => {
    // Clear any active timers
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    // Reset transition tracking
    letterTransitions.reset();
    exitTransitions.reset();

    // Unlock scroll before completing
    unlockScroll();

    // Complete the intro
    onComplete();
  }, [onComplete, letterTransitions, exitTransitions, unlockScroll]);

  // Handle escape key for skip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleSkip();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Start the intro animation and set up transition tracking
  useEffect(() => {
    if (autoStart) {
      // Lock scroll when intro starts
      lockScroll();

      // Start letters immediately (CSS handles 1000ms delay)
      setShowLetters(true);

      // Start tracking letter transitions when wrapper is available
      if (wrapperRef.current) {
        letterTransitions.startTracking(wrapperRef.current);
      }

      return () => {
        // Cleanup timers
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }

        // Ensure scroll is unlocked on cleanup
        unlockScroll();
      };
    }
  }, [autoStart, letterTransitions, lockScroll, unlockScroll]);

  // Set up exit transition tracking when exit state changes
  useEffect(() => {
    if (exit && wrapperRef.current) {
      // Stop tracking letter transitions
      letterTransitions.stopTracking(wrapperRef.current);

      // Start tracking exit transition
      exitTransitions.startTracking(wrapperRef.current);
    }
  }, [exit, letterTransitions, exitTransitions]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${exit ? styles.exit : ''}`}
      onTransitionEnd={exit ? exitTransitions.handleTransitionEnd : letterTransitions.handleTransitionEnd}
      onClick={handleSkip}
      role="presentation"
      aria-label="IEEE CIS intro animation. Press Escape or click to skip."
    >
      {/* Five column overlays for staggered exit animation */}
      {exit && (
        <div className={styles.columnOverlays}>
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={styles.column}
              style={{ '--column-index': index } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      
      <div className={styles.lettersContainer}>
        <SharedLetter
          letter="C"
          svgUrl={CSvgUrl}
          className={`${styles.logoGroup} ${showLetters ? styles.show : ''}`}
          style={{ '--index': 0 } as React.CSSProperties}
        />
        <SharedLetter
          letter="I"
          svgUrl={ISvgUrl}
          className={`${styles.logoGroup} ${showLetters ? styles.show : ''}`}
          style={{ '--index': 1 } as React.CSSProperties}
        />
        <SharedLetter
          letter="S"
          svgUrl={SSvgUrl}
          className={`${styles.logoGroup} ${showLetters ? styles.show : ''}`}
          style={{ '--index': 2 } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default IntroScene;