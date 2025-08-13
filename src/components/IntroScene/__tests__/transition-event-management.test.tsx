import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import IntroScene from '../IntroScene';

// Mock the device detection hook
vi.mock('../hooks/useDeviceDetection', () => ({
  default: () => ({
    isDesktop: true,
    isMobile: false,
    screenWidth: 1920,
    screenHeight: 1080,
    hasReducedMotion: false,
  }),
}));

// Mock timers
vi.useFakeTimers();

// Mock TransitionEvent for testing environment
class MockTransitionEvent extends Event {
  propertyName: string;
  target: EventTarget | null;

  constructor(type: string, eventInitDict?: { propertyName?: string; target?: EventTarget }) {
    super(type);
    this.propertyName = eventInitDict?.propertyName || '';
    this.target = eventInitDict?.target || null;
  }
}

// Make TransitionEvent available globally
global.TransitionEvent = MockTransitionEvent as any;

describe('IntroScene - Transition Event Management', () => {
  let mockOnComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnComplete = vi.fn();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Letter entrance transition management', () => {
    it('should track letter entrance transitions and proceed to exit', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      expect(wrapper).toBeInTheDocument();

      // Wait for component to initialize and start tracking
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Simulate letter entrance transitions (transform and opacity for each letter)
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      expect(letterElements).toHaveLength(3);

      // Simulate transition events for each letter (transform transitions)
      act(() => {
        letterElements.forEach((element, index) => {
          const transformEvent = new TransitionEvent('transitionend', {
            propertyName: 'transform',
            target: element,
          });
          Object.defineProperty(transformEvent, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(transformEvent);
        });
      });

      // Should not complete yet (onComplete not called)
      expect(mockOnComplete).not.toHaveBeenCalled();

      // Advance time to trigger exit after hold period
      act(() => {
        vi.advanceTimersByTime(1500); // Hold time
      });

      // Wrapper should now have exit class
      expect(wrapper.className).toContain('exit');
    });

    it('should handle transition event delegation correctly', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      // Wait for initialization
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Simulate transitions from child elements (letters)
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      
      act(() => {
        letterElements.forEach((element) => {
          // Create transition event with proper target/currentTarget setup
          const event = new TransitionEvent('transitionend', {
            propertyName: 'transform',
            target: element,
          });
          
          // Set currentTarget to wrapper for delegation
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          
          wrapper.dispatchEvent(event);
        });
      });

      // Should trigger exit timer after all letter transitions
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(wrapper.className).toContain('exit');
    });

    it('should filter transitions by property name', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');

      // Simulate non-tracked property transitions (should be ignored)
      act(() => {
        letterElements.forEach((element) => {
          const event = new TransitionEvent('transitionend', {
            propertyName: 'color', // Not in propertyFilter
            target: element,
          });
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Should not trigger exit (transitions were filtered out)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(wrapper.className).not.toContain('exit');

      // Now simulate tracked property transitions
      act(() => {
        letterElements.forEach((element) => {
          const event = new TransitionEvent('transitionend', {
            propertyName: 'transform', // In propertyFilter
            target: element,
          });
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Should now trigger exit
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(wrapper.className).toContain('exit');
    });
  });

  describe('Exit transition management', () => {
    it('should complete intro when exit transition finishes', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Complete letter transitions to trigger exit
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      act(() => {
        letterElements.forEach((element) => {
          const event = new TransitionEvent('transitionend', {
            propertyName: 'transform',
            target: element,
          });
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Advance to exit phase
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(wrapper.className).toContain('exit');

      // Simulate exit transition completion
      act(() => {
        const exitEvent = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: wrapper,
        });
        Object.defineProperty(exitEvent, 'currentTarget', {
          value: wrapper,
          writable: false
        });
        wrapper.dispatchEvent(exitEvent);
      });

      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should switch from letter tracking to exit tracking', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Complete letter transitions
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      act(() => {
        letterElements.forEach((element) => {
          const event = new TransitionEvent('transitionend', {
            propertyName: 'transform',
            target: element,
          });
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Move to exit phase
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Additional letter transitions should now be ignored
      act(() => {
        const extraLetterEvent = new TransitionEvent('transitionend', {
          propertyName: 'opacity',
          target: letterElements[0],
        });
        Object.defineProperty(extraLetterEvent, 'currentTarget', {
          value: wrapper,
          writable: false
        });
        wrapper.dispatchEvent(extraLetterEvent);
      });

      // Should not complete yet (exit transition not fired)
      expect(mockOnComplete).not.toHaveBeenCalled();

      // Fire exit transition
      act(() => {
        const exitEvent = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: wrapper,
        });
        Object.defineProperty(exitEvent, 'currentTarget', {
          value: wrapper,
          writable: false
        });
        wrapper.dispatchEvent(exitEvent);
      });

      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('Fallback timeout handling', () => {
    it('should trigger fallback for letter transitions', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Don't fire any transition events, let fallback timeout trigger
      act(() => {
        vi.advanceTimersByTime(3000); // Letter transition fallback timeout
      });

      // Should proceed to exit phase via fallback
      act(() => {
        vi.advanceTimersByTime(100); // Quick exit on timeout
      });

      expect(wrapper.className).toContain('exit');
    });

    it('should trigger fallback for exit transition', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Complete letter transitions normally
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      act(() => {
        letterElements.forEach((element) => {
          const event = new TransitionEvent('transitionend', {
            propertyName: 'transform',
            target: element,
          });
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Move to exit phase
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Don't fire exit transition, let fallback trigger
      act(() => {
        vi.advanceTimersByTime(2000); // Exit transition fallback timeout
      });

      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should not trigger fallback if transitions complete in time', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Complete letter transitions before fallback
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      act(() => {
        letterElements.forEach((element) => {
          const event = new TransitionEvent('transitionend', {
            propertyName: 'transform',
            target: element,
          });
          Object.defineProperty(event, 'currentTarget', {
            value: wrapper,
            writable: false
          });
          wrapper.dispatchEvent(event);
        });
      });

      // Advance past fallback time
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Should be in exit phase (not completed via fallback)
      expect(wrapper.className).toContain('exit');
      expect(mockOnComplete).not.toHaveBeenCalled();

      // Complete exit transition
      act(() => {
        const exitEvent = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: wrapper,
        });
        Object.defineProperty(exitEvent, 'currentTarget', {
          value: wrapper,
          writable: false
        });
        wrapper.dispatchEvent(exitEvent);
      });

      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('Skip functionality with transition cleanup', () => {
    it('should clean up transition tracking when skipped', async () => {
      render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Start some transitions
      const letterElements = wrapper.querySelectorAll('[class*="logoGroup"]');
      act(() => {
        const event = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: letterElements[0],
        });
        Object.defineProperty(event, 'currentTarget', {
          value: wrapper,
          writable: false
        });
        wrapper.dispatchEvent(event);
      });

      // Skip the intro
      act(() => {
        wrapper.click();
      });

      expect(mockOnComplete).toHaveBeenCalled();

      // Additional transition events should not cause issues
      act(() => {
        const event = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: letterElements[1],
        });
        Object.defineProperty(event, 'currentTarget', {
          value: wrapper,
          writable: false
        });
        wrapper.dispatchEvent(event);
      });

      // Should only be called once (from skip, not from transition)
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory management', () => {
    it('should clean up event listeners on unmount', async () => {
      const { unmount } = render(<IntroScene onComplete={mockOnComplete} />);

      const wrapper = screen.getByRole('presentation');
      const removeEventListenerSpy = vi.spyOn(wrapper, 'removeEventListener');
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function)
      );
    });

    it('should clear timers on unmount', async () => {
      const { unmount } = render(<IntroScene onComplete={mockOnComplete} />);
      
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      unmount();

      // Advance time past all possible timeouts
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should not call onComplete after unmount
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});