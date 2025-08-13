import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { BlueOverlayProps } from '../types';
import styles from '../styles/intro.module.scss';

const BlueOverlay: React.FC<BlueOverlayProps> = ({
  isVisible,
  onRevealComplete,
  revealDirection = 'center'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    // Create GSAP timeline for reveal animation
    timelineRef.current = gsap.timeline({
      paused: true,
      onComplete: () => {
        onRevealComplete();
      }
    });

    // Set initial state
    gsap.set(overlayRef.current, {
      scale: 1,
      opacity: 1,
      transformOrigin: 'center center'
    });

    // Configure animation based on reveal direction
    switch (revealDirection) {
      case 'center':
        timelineRef.current.to(overlayRef.current, {
          scale: 0,
          opacity: 0,
          duration: 1.5,
          ease: 'expo.out'
        });
        break;
      case 'left':
        timelineRef.current.to(overlayRef.current, {
          x: '-100%',
          duration: 1.5,
          ease: 'expo.out'
        });
        break;
      case 'right':
        timelineRef.current.to(overlayRef.current, {
          x: '100%',
          duration: 1.5,
          ease: 'expo.out'
        });
        break;
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [revealDirection, onRevealComplete]);

  useEffect(() => {
    if (!timelineRef.current) return;

    if (isVisible) {
      // Reset to initial state when becoming visible
      timelineRef.current.restart();
      timelineRef.current.pause();
    } else {
      // Start reveal animation when not visible
      timelineRef.current.play();
    }
  }, [isVisible]);

  // Handle reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion && !isVisible) {
      // Skip animation for reduced motion
      onRevealComplete();
    }
  }, [isVisible, onRevealComplete]);

  return (
    <div
      ref={overlayRef}
      className={styles.blueOverlay}
      data-testid="blue-overlay"
      aria-hidden="true"
    />
  );
};

export default BlueOverlay;