import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import IntroScene from '../IntroScene';

// Mock the hooks
vi.mock('../hooks', () => ({
  useDeviceDetection: () => ({
    isDesktop: true,
    isMobile: false,
    screenWidth: 1920,
    screenHeight: 1080,
    hasReducedMotion: false
  }),
  useTransitionEnd: (callbacks: any, options: any) => ({
    startTracking: vi.fn(),
    stopTracking: vi.fn(),
    reset: vi.fn(),
    getCompletedCount: () => 0,
    isComplete: () => false,
    handleTransitionEnd: vi.fn((event: any) => {
      // Simulate transition completion for testing
      if (callbacks.onAllTransitionsComplete) {
        setTimeout(callbacks.onAllTransitionsComplete, 0);
      }
    })
  }),
  useScrollLock: () => ({
    isLocked: false,
    lockScroll: vi.fn(),
    unlockScroll: vi.fn(),
    toggleScrollLock: vi.fn(),
  })
}));

// Mock the letter components with realistic transition behavior
vi.mock('../components', () => ({
  LetterC: ({ className, style, onTransitionEnd }: any) => (
    <div 
      data-testid="letter-c" 
      className={className}
      style={style}
      onTransitionEnd={onTransitionEnd}
    >
      C
    </div>
  ),
  LetterI: ({ className, style, onTransitionEnd }: any) => (
    <div 
      data-testid="letter-i" 
      className={className}
      style={style}
      onTransitionEnd={onTransitionEnd}
    >
      I
    </div>
  ),
  LetterS: ({ className, style, onTransitionEnd }: any) => (
    <div 
      data-testid="letter-s" 
      className={className}
      style={style}
      onTransitionEnd={onTransitionEnd}
    >
      S
    </div>
  )
}));

describe('IntroScene - Integration Tests', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Complete Intro Flow Integration', () => {
    it('should execute complete intro sequence with proper timing', async () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Verify initial state
      const wrapper = screen.getByRole('presentation');
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Check that letters have show class applied immediately
      expect(letterC.className).toContain('show');
      expect(letterI.className).toContain('show');
      expect(letterS.className).toContain('show');

      // Check CSS custom properties for stagger timing
      expect(letterC.style.getPropertyValue('--index')).toBe('0');
      expect(letterI.style.getPropertyValue('--index')).toBe('1');
      expect(letterS.style.getPropertyValue('--index')).toBe('2');

      // Simulate letter entrance transitions completing (in staggered order)
      act(() => {
        fireEvent.transitionEnd(letterC); // First letter (--index: 0)
      });

      act(() => {
        fireEvent.transitionEnd(letterI); // Second letter (--index: 1)
      });

      act(() => {
        fireEvent.transitionEnd(letterS); // Third letter (--index: 2)
      });

      // At this point, all letters have completed entrance, exit timer should start
      // Fast-forward through hold time (1500ms)
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Wrapper should now have exit class
      expect(wrapper.className).toContain('exit');

      // Simulate wrapper exit transition completion
      act(() => {
        fireEvent.transitionEnd(wrapper);
      });

      // onComplete should be called
      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });

    it('should handle partial transition completion gracefully', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      // Note: Not triggering letterS transition

      // Simulate only partial letter transitions
      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
      });

      // Fast-forward through hold time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const wrapper = screen.getByRole('presentation');
      // Exit should not trigger yet because not all letters completed
      expect(wrapper.className).not.toContain('exit');

      // Complete the last letter transition
      const letterS = screen.getByTestId('letter-s');
      act(() => {
        fireEvent.transitionEnd(letterS);
      });

      // Now fast-forward through hold time again
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Now exit should trigger
      expect(wrapper.className).toContain('exit');
    });

    it('should use fallback timeout when transitions fail', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Don't trigger any transition events, just let fallback timeout run
      act(() => {
        vi.advanceTimersByTime(5000); // 5 second fallback
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Device Detection Integration', () => {
    it('should render intro on desktop with normal motion preferences', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Should render intro and not call onComplete immediately
      expect(onCompleteMock).not.toHaveBeenCalled();
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });
  });

  describe('Transition Event Management Integration', () => {
    it('should properly distinguish between letter and wrapper transition events', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const wrapper = screen.getByRole('presentation');
      const letterC = screen.getByTestId('letter-c');

      // Simulate wrapper transition (should not count towards letter completion)
      act(() => {
        fireEvent.transitionEnd(wrapper);
      });

      // Fast-forward time - exit should not trigger yet
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(wrapper.className).not.toContain('exit');

      // Now simulate letter transition
      act(() => {
        fireEvent.transitionEnd(letterC);
      });

      // Still need other letters to complete
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Now fast-forward through hold time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(wrapper.className).toContain('exit');
    });

    it('should handle rapid transition events correctly', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Simulate rapid-fire transition events
      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
        // Duplicate events (should not cause issues)
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
      });

      // Fast-forward through hold time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const wrapper = screen.getByRole('presentation');
      expect(wrapper.className).toContain('exit');

      // Complete wrapper transition
      act(() => {
        fireEvent.transitionEnd(wrapper);
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skip Functionality Integration', () => {
    it('should handle skip during letter entrance phase', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Simulate partial letter completion
      const letterC = screen.getByTestId('letter-c');
      act(() => {
        fireEvent.transitionEnd(letterC);
      });

      // Skip via Escape key
      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });

    it('should handle skip during exit phase', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Complete all letter transitions
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Fast-forward to exit phase
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const wrapper = screen.getByRole('presentation');
      expect(wrapper.className).toContain('exit');

      // Skip via click during exit
      act(() => {
        fireEvent.click(wrapper);
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });

    it('should cleanup timers when skipping', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      render(<IntroScene onComplete={onCompleteMock} />);

      // Start the exit timer by completing letter transitions
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Skip before exit timer completes
      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Management Integration', () => {
    it('should cleanup all resources on unmount during active animation', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<IntroScene onComplete={onCompleteMock} />);

      // Start some transitions
      const letterC = screen.getByTestId('letter-c');
      act(() => {
        fireEvent.transitionEnd(letterC);
      });

      // Unmount during active animation
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should cleanup all resources on unmount during exit phase', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<IntroScene onComplete={onCompleteMock} />);

      // Complete all letter transitions to start exit phase
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Unmount during exit phase
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('AutoStart Integration', () => {
    it('should not start animation when autoStart is false', () => {
      render(<IntroScene onComplete={onCompleteMock} autoStart={false} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Letters should not have show class when autoStart is false
      expect(letterC.className).not.toContain('show');
      expect(letterI.className).not.toContain('show');
      expect(letterS.className).not.toContain('show');

      // Fast-forward time - nothing should happen
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onCompleteMock).not.toHaveBeenCalled();
    });

    it('should start animation immediately when autoStart is true (default)', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Letters should have show class immediately
      expect(letterC.className).toContain('show');
      expect(letterI.className).toContain('show');
      expect(letterS.className).toContain('show');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing transition events gracefully with fallback', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Don't trigger any transition events, rely on fallback timeout
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount during transition events', () => {
      const { unmount } = render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      
      // Start a transition
      act(() => {
        fireEvent.transitionEnd(letterC);
      });

      // Unmount immediately
      unmount();

      // Should not throw errors or cause memory leaks
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(5000);
        });
      }).not.toThrow();
    });
  });
});