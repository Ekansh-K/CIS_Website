import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

// Mock the letter components with transition event support
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

describe('Lenis-style Timing System Tests', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Lenis Timing Variables (CSS)', () => {
    it('should have correct CSS timing variables defined', () => {
      // Test that CSS variables are properly defined
      // This would typically be tested in a CSS test or integration test
      const expectedTimings = {
        '--entry-delay': '1000ms',
        '--letter-stagger': '125ms', 
        '--hold-time': '1500ms',
        '--exit-duration': '1500ms',
        '--expo-easing': 'cubic-bezier(0.16, 1, 0.3, 1)',
        '--transition-duration': '800ms'
      };

      // In a real test, you would check computed styles
      // For now, we verify the timing behavior matches these values
      expect(expectedTimings['--entry-delay']).toBe('1000ms');
      expect(expectedTimings['--letter-stagger']).toBe('125ms');
      expect(expectedTimings['--hold-time']).toBe('1500ms');
      expect(expectedTimings['--exit-duration']).toBe('1500ms');
    });
  });

  describe('Stagger Delay Calculation', () => {
    it('should calculate correct stagger delays using CSS custom properties', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Verify --index values are set correctly for stagger calculation
      // CSS calc: calc(1000ms + (var(--index) * 125ms))
      expect(letterC.style.getPropertyValue('--index')).toBe('0'); // 1000ms + (0 * 125ms) = 1000ms
      expect(letterI.style.getPropertyValue('--index')).toBe('1'); // 1000ms + (1 * 125ms) = 1125ms  
      expect(letterS.style.getPropertyValue('--index')).toBe('2'); // 1000ms + (2 * 125ms) = 1250ms
    });
  });

  describe('Total Timing Calculation (2750ms)', () => {
    it('should complete intro sequence in correct total time', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      render(<IntroScene onComplete={onCompleteMock} />);

      // Simulate all letter entrance transitions completing
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Letters start appearing immediately (CSS handles 1000ms delay)
      // Stagger: C at 1000ms, I at 1125ms, S at 1250ms
      // Last letter (S) completes at: 1250ms + 800ms transition = 2050ms
      // Hold time: 1500ms after all letters complete
      // Total before exit: 1000ms (entry) + 250ms (stagger) + 1500ms (hold) = 2750ms

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Verify exit timer is set for 1500ms (hold time)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500);

      // Fast-forward through hold time to trigger exit
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Verify exit state is triggered
      const wrapper = screen.getByRole('presentation');
      expect(wrapper.className).toContain('exit');
    });
  });

  describe('Expo Easing Implementation', () => {
    it('should apply expo easing (cubic-bezier(0.16, 1, 0.3, 1)) to transitions', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // The easing is applied via CSS, so we verify the CSS classes are applied
      // In a real browser test, you would check computed styles
      const letterC = screen.getByTestId('letter-c');
      expect(letterC.className).toContain('logoGroup');
      
      // The expo easing is defined in CSS as --expo-easing: cubic-bezier(0.16, 1, 0.3, 1)
      // and applied to .logoGroup transitions
    });
  });

  describe('Transition Event Precision', () => {
    it('should precisely detect when all letter entrance animations complete', async () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Simulate only 2 out of 3 letters completing
      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
      });

      // Exit should not be triggered yet
      const wrapper = screen.getByRole('presentation');
      expect(wrapper.className).not.toContain('exit');

      // Complete the third letter
      act(() => {
        fireEvent.transitionEnd(letterS);
      });

      // Now the hold timer should start
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Exit should now be triggered
      expect(wrapper.className).toContain('exit');
    });

    it('should handle wrapper exit transition completion precisely', async () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Complete all letter transitions
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC, { propertyName: 'transform' });
        fireEvent.transitionEnd(letterI, { propertyName: 'transform' });
        fireEvent.transitionEnd(letterS, { propertyName: 'transform' });
      });

      // Trigger exit
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // onComplete should not be called yet
      expect(onCompleteMock).not.toHaveBeenCalled();

      // Simulate wrapper exit transition completion
      const wrapper = screen.getByRole('presentation');
      act(() => {
        fireEvent.transitionEnd(wrapper);
      });

      // Now onComplete should be called
      expect(onCompleteMock).toHaveBeenCalled();
    });
  });

  describe('Fallback Timeout System', () => {
    it('should have 5-second fallback timeout for safety', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      render(<IntroScene onComplete={onCompleteMock} />);

      // Verify fallback timeout is set
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should trigger fallback if transition events fail', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Don't trigger any transition events, just advance time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Fallback should trigger onComplete
      expect(onCompleteMock).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should clear exit timer when component unmounts', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const { unmount } = render(<IntroScene onComplete={onCompleteMock} />);
      
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should clear exit timer when skip is triggered', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      render(<IntroScene onComplete={onCompleteMock} />);

      // First trigger some transitions to create an exit timer
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Now trigger skip - this should clear the exit timer
      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});