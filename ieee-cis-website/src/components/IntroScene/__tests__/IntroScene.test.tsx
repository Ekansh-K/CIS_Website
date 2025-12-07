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

// Mock the letter components
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

describe('IntroScene - Simplified Lenis-style Timing System', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('CSS Class Application', () => {
    it('should apply show class to letters when showLetters is true', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      expect(letterC.className).toContain('show');
      expect(letterI.className).toContain('show');
      expect(letterS.className).toContain('show');
    });

    it('should apply logoGroup class to all letters', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      expect(letterC.className).toContain('logoGroup');
      expect(letterI.className).toContain('logoGroup');
      expect(letterS.className).toContain('logoGroup');
    });

    it('should apply exit class to wrapper when exit state is true', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Simulate all letter transitions completing
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Fast-forward to trigger exit
      act(() => {
        vi.advanceTimersByTime(1500); // Hold time
      });

      const wrapper = screen.getByRole('presentation');
      expect(wrapper.className).toContain('exit');
    });
  });

  describe('CSS Custom Properties for Stagger Delays', () => {
    it('should set correct --index values for each letter', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      expect(letterC.style.getPropertyValue('--index')).toBe('0');
      expect(letterI.style.getPropertyValue('--index')).toBe('1');
      expect(letterS.style.getPropertyValue('--index')).toBe('2');
    });
  });

  describe('Simplified Timing System', () => {
    it('should use single setTimeout for exit timing (2750ms total)', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      render(<IntroScene onComplete={onCompleteMock} />);

      // Simulate all letter transitions completing
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Check that setTimeout was called with 1500ms (hold time)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500);
    });

    it('should have fallback timeout of 5 seconds', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      render(<IntroScene onComplete={onCompleteMock} />);

      // Check that fallback timeout was set
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });
  });

  describe('Transition Event Handling', () => {
    it('should handle transitionend events for precise animation completion detection', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      // Simulate transition end events
      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Fast-forward through hold time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      const wrapper = screen.getByRole('presentation');
      expect(wrapper.className).toContain('exit');
    });

    it('should call onComplete when wrapper exit transition ends', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      // Simulate all letter transitions completing
      const letterC = screen.getByTestId('letter-c');
      const letterI = screen.getByTestId('letter-i');
      const letterS = screen.getByTestId('letter-s');

      act(() => {
        fireEvent.transitionEnd(letterC);
        fireEvent.transitionEnd(letterI);
        fireEvent.transitionEnd(letterS);
      });

      // Fast-forward to trigger exit
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Simulate wrapper exit transition completion
      const wrapper = screen.getByRole('presentation');
      act(() => {
        fireEvent.transitionEnd(wrapper);
      });

      expect(onCompleteMock).toHaveBeenCalled();
    });

    it('should only count transitions from letter elements', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const wrapper = screen.getByRole('presentation');
      const letterC = screen.getByTestId('letter-c');

      // Simulate transition from wrapper (should not count)
      act(() => {
        fireEvent.transitionEnd(wrapper);
      });

      // Simulate transition from letter (should count)
      act(() => {
        fireEvent.transitionEnd(letterC);
      });

      // Only letter transitions should trigger the exit timer
      // We can't directly test the counter, but we can test the behavior
      expect(wrapper.className).not.toContain('exit');
    });
  });

  describe('Skip Functionality', () => {
    it('should skip intro on Escape key press', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(onCompleteMock).toHaveBeenCalled();
    });

    it('should skip intro on click', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const wrapper = screen.getByRole('presentation');
      
      act(() => {
        fireEvent.click(wrapper);
      });

      expect(onCompleteMock).toHaveBeenCalled();
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('should cleanup timers on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const { unmount } = render(<IntroScene onComplete={onCompleteMock} />);
      
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<IntroScene onComplete={onCompleteMock} />);
      
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<IntroScene onComplete={onCompleteMock} />);

      const wrapper = screen.getByRole('presentation');
      expect(wrapper).toHaveAttribute('aria-label', 'IEEE CIS intro animation. Press Escape or click to skip.');
    });
  });
});