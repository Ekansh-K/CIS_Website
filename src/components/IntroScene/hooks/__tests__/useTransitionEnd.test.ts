import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import useTransitionEnd from '../useTransitionEnd';

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

describe('useTransitionEnd', () => {
  let mockElement: HTMLElement;
  let mockCallbacks: {
    onTransition: ReturnType<typeof vi.fn>;
    onAllTransitionsComplete: ReturnType<typeof vi.fn>;
    onFallbackTimeout: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create a mock DOM element
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    // Create mock callbacks
    mockCallbacks = {
      onTransition: vi.fn(),
      onAllTransitionsComplete: vi.fn(),
      onFallbackTimeout: vi.fn(),
    };
  });

  afterEach(() => {
    // Clean up DOM
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
    
    // Clear all mocks
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks)
      );

      expect(result.current.getCompletedCount()).toBe(0);
      expect(result.current.isComplete()).toBe(false);
    });

    it('should start and stop tracking elements', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks)
      );

      const addEventListenerSpy = vi.spyOn(mockElement, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');

      // Start tracking
      act(() => {
        result.current.startTracking(mockElement);
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function)
      );

      // Stop tracking
      act(() => {
        result.current.stopTracking(mockElement);
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function)
      );
    });

    it('should not add duplicate listeners for the same element', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks)
      );

      const addEventListenerSpy = vi.spyOn(mockElement, 'addEventListener');

      // Start tracking twice
      act(() => {
        result.current.startTracking(mockElement);
        result.current.startTracking(mockElement);
      });

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Transition event handling', () => {
    it('should handle single transition completion', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { expectedTransitions: 1 })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Simulate transition end event
      const transitionEvent = new TransitionEvent('transitionend', {
        propertyName: 'transform',
        target: mockElement,
      });

      act(() => {
        mockElement.dispatchEvent(transitionEvent);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalledWith(transitionEvent, 1);
      expect(mockCallbacks.onAllTransitionsComplete).toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(1);
      expect(result.current.isComplete()).toBe(true);
    });

    it('should handle multiple transition completions', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { expectedTransitions: 3 })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Simulate first transition
      act(() => {
        const event1 = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        mockElement.dispatchEvent(event1);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalledTimes(1);
      expect(mockCallbacks.onAllTransitionsComplete).not.toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(1);

      // Simulate second transition
      act(() => {
        const event2 = new TransitionEvent('transitionend', {
          propertyName: 'opacity',
          target: mockElement,
        });
        mockElement.dispatchEvent(event2);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalledTimes(2);
      expect(mockCallbacks.onAllTransitionsComplete).not.toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(2);

      // Simulate third transition
      act(() => {
        const event3 = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        mockElement.dispatchEvent(event3);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalledTimes(3);
      expect(mockCallbacks.onAllTransitionsComplete).toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(3);
      expect(result.current.isComplete()).toBe(true);
    });

    it('should filter transitions by property name', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { 
          expectedTransitions: 1,
          propertyFilter: ['transform']
        })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Simulate filtered out transition
      act(() => {
        const event1 = new TransitionEvent('transitionend', {
          propertyName: 'opacity',
          target: mockElement,
        });
        mockElement.dispatchEvent(event1);
      });

      expect(mockCallbacks.onTransition).not.toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(0);

      // Simulate allowed transition
      act(() => {
        const event2 = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        mockElement.dispatchEvent(event2);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalledTimes(1);
      expect(result.current.getCompletedCount()).toBe(1);
    });
  });

  describe('Event delegation', () => {
    it('should handle event delegation correctly', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { 
          expectedTransitions: 1,
          enableDelegation: true
        })
      );

      const childElement = document.createElement('span');
      mockElement.appendChild(childElement);

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Simulate transition from child element (should count with delegation)
      act(() => {
        const event = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: childElement,
        });
        Object.defineProperty(event, 'currentTarget', {
          value: mockElement,
          writable: false
        });
        mockElement.dispatchEvent(event);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(1);
    });

    it('should ignore parent element transitions with delegation enabled', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { 
          expectedTransitions: 1,
          enableDelegation: true
        })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Simulate transition from parent element (should not count with delegation)
      act(() => {
        const event = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        Object.defineProperty(event, 'currentTarget', {
          value: mockElement,
          writable: false
        });
        mockElement.dispatchEvent(event);
      });

      expect(mockCallbacks.onTransition).not.toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(0);
    });
  });

  describe('Fallback timeout', () => {
    it('should trigger fallback timeout when transitions do not complete', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { 
          expectedTransitions: 2,
          fallbackTimeout: 1000
        })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Advance timer to trigger fallback
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockCallbacks.onFallbackTimeout).toHaveBeenCalled();
      expect(result.current.isComplete()).toBe(true);
    });

    it('should not trigger fallback if transitions complete in time', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { 
          expectedTransitions: 1,
          fallbackTimeout: 1000
        })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Complete transition before timeout
      act(() => {
        const event = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        mockElement.dispatchEvent(event);
      });

      // Advance timer past fallback time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(mockCallbacks.onFallbackTimeout).not.toHaveBeenCalled();
      expect(mockCallbacks.onAllTransitionsComplete).toHaveBeenCalled();
    });
  });

  describe('Reset functionality', () => {
    it('should reset tracking state correctly', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { expectedTransitions: 2 })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Complete one transition
      act(() => {
        const event = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        mockElement.dispatchEvent(event);
      });

      expect(result.current.getCompletedCount()).toBe(1);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.getCompletedCount()).toBe(0);
      expect(result.current.isComplete()).toBe(false);
    });

    it('should clear fallback timer on reset', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { 
          expectedTransitions: 2,
          fallbackTimeout: 1000
        })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Reset before timeout
      act(() => {
        result.current.reset();
      });

      // Advance timer past original fallback time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(mockCallbacks.onFallbackTimeout).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useTransitionEnd(mockCallbacks)
      );

      const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');

      act(() => {
        result.current.startTracking(mockElement);
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function)
      );
    });

    it('should clear fallback timer on unmount', () => {
      const { unmount } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { fallbackTimeout: 1000 })
      );

      unmount();

      // Advance timer past fallback time
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(mockCallbacks.onFallbackTimeout).not.toHaveBeenCalled();
    });
  });

  describe('Direct handler usage', () => {
    it('should provide direct transition end handler for React events', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { expectedTransitions: 1 })
      );

      expect(typeof result.current.handleTransitionEnd).toBe('function');

      // Simulate React transition event
      const reactEvent = {
        propertyName: 'transform',
        target: mockElement,
        currentTarget: mockElement,
      } as React.TransitionEvent;

      act(() => {
        result.current.handleTransitionEnd(reactEvent as any);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalled();
      expect(result.current.getCompletedCount()).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle null element gracefully', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks)
      );

      expect(() => {
        act(() => {
          result.current.startTracking(null);
          result.current.stopTracking(null);
        });
      }).not.toThrow();
    });

    it('should ignore events after completion', () => {
      const { result } = renderHook(() => 
        useTransitionEnd(mockCallbacks, { expectedTransitions: 1 })
      );

      act(() => {
        result.current.startTracking(mockElement);
      });

      // Complete first transition
      act(() => {
        const event1 = new TransitionEvent('transitionend', {
          propertyName: 'transform',
          target: mockElement,
        });
        mockElement.dispatchEvent(event1);
      });

      expect(result.current.isComplete()).toBe(true);
      expect(mockCallbacks.onTransition).toHaveBeenCalledTimes(1);

      // Try to trigger another transition (should be ignored)
      act(() => {
        const event2 = new TransitionEvent('transitionend', {
          propertyName: 'opacity',
          target: mockElement,
        });
        mockElement.dispatchEvent(event2);
      });

      expect(mockCallbacks.onTransition).toHaveBeenCalledTimes(1);
      expect(result.current.getCompletedCount()).toBe(1);
    });
  });
});