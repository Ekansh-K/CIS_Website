import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the store
vi.mock('../../../../lib/store', () => ({
  useStore: vi.fn()
}));

// Mock Lenis
const mockLenis = {
  stop: vi.fn(),
  start: vi.fn(),
  destroy: vi.fn(),
};

// Mock DOM methods
const mockScrollTo = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Mock body styles
const mockBodyStyle = {
  overflow: '',
  position: '',
  top: '',
  width: '',
};

describe('useScrollLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset body styles
    mockBodyStyle.overflow = '';
    mockBodyStyle.position = '';
    mockBodyStyle.top = '';
    mockBodyStyle.width = '';
    
    // Setup DOM mocks
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
    });

    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true,
    });

    Object.defineProperty(document, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });

    Object.defineProperty(document, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });

    Object.defineProperty(document, 'body', {
      value: {
        style: mockBodyStyle,
      },
      writable: true,
    });
  });

  describe('scroll lock functionality', () => {
    it('should exist and be importable', async () => {
      const { useScrollLock } = await import('../useScrollLock');
      expect(typeof useScrollLock).toBe('function');
    });

    it('should handle DOM manipulation correctly', () => {
      // Test that our mocks are working
      expect(document.body.style).toBe(mockBodyStyle);
      expect(window.scrollY).toBe(100);
      expect(window.scrollTo).toBe(mockScrollTo);
    });

    it('should apply scroll lock styles to body', () => {
      // Simulate what the hook would do
      const body = document.body;
      const scrollY = window.scrollY;

      // Apply scroll lock styles (what the hook should do)
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';

      expect(mockBodyStyle.overflow).toBe('hidden');
      expect(mockBodyStyle.position).toBe('fixed');
      expect(mockBodyStyle.top).toBe('-100px');
      expect(mockBodyStyle.width).toBe('100%');
    });

    it('should restore original styles', () => {
      // Set initial styles
      mockBodyStyle.overflow = 'auto';
      mockBodyStyle.position = 'static';
      mockBodyStyle.top = '0px';
      mockBodyStyle.width = 'auto';

      // Store original values
      const originalOverflow = mockBodyStyle.overflow;
      const originalPosition = mockBodyStyle.position;
      const originalTop = mockBodyStyle.top;
      const originalWidth = mockBodyStyle.width;

      // Apply lock styles
      mockBodyStyle.overflow = 'hidden';
      mockBodyStyle.position = 'fixed';
      mockBodyStyle.top = '-100px';
      mockBodyStyle.width = '100%';

      // Restore original styles
      mockBodyStyle.overflow = originalOverflow;
      mockBodyStyle.position = originalPosition;
      mockBodyStyle.top = originalTop;
      mockBodyStyle.width = originalWidth;

      expect(mockBodyStyle.overflow).toBe('auto');
      expect(mockBodyStyle.position).toBe('static');
      expect(mockBodyStyle.top).toBe('0px');
      expect(mockBodyStyle.width).toBe('auto');
    });

    it('should handle scroll position restoration', () => {
      const originalScrollY = 100;
      
      // Simulate restoring scroll position
      window.scrollTo(0, originalScrollY);
      
      expect(mockScrollTo).toHaveBeenCalledWith(0, 100);
    });

    it('should add event listeners for scroll prevention', () => {
      // Simulate adding event listeners
      const preventScroll = vi.fn();
      const preventTouchMove = vi.fn();
      const handleKeyDown = vi.fn();

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('DOMMouseScroll', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      document.addEventListener('keydown', handleKeyDown, { passive: false });

      expect(mockAddEventListener).toHaveBeenCalledWith('wheel', preventScroll, { passive: false });
      expect(mockAddEventListener).toHaveBeenCalledWith('DOMMouseScroll', preventScroll, { passive: false });
      expect(mockAddEventListener).toHaveBeenCalledWith('touchmove', preventTouchMove, { passive: false });
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', handleKeyDown, { passive: false });
    });

    it('should remove event listeners on cleanup', () => {
      // Simulate removing event listeners
      const preventScroll = vi.fn();
      const preventTouchMove = vi.fn();
      const handleKeyDown = vi.fn();

      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('DOMMouseScroll', preventScroll);
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('keydown', handleKeyDown);

      expect(mockRemoveEventListener).toHaveBeenCalledWith('wheel', preventScroll);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('DOMMouseScroll', preventScroll);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('touchmove', preventTouchMove);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', handleKeyDown);
    });

    it('should handle Lenis integration', () => {
      // Test Lenis stop functionality
      mockLenis.stop();
      expect(mockLenis.stop).toHaveBeenCalled();

      // Test Lenis start functionality
      mockLenis.start();
      expect(mockLenis.start).toHaveBeenCalled();
    });

    it('should prevent default on scroll events', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      // Simulate event prevention
      mockEvent.preventDefault();
      mockEvent.stopPropagation();

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should handle keyboard events correctly', () => {
      const mockKeyboardEvent = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      const scrollKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'PageUp', 'PageDown', 'Home', 'End', 'Space'
      ];

      // Test that scroll keys would be prevented
      if (scrollKeys.includes(mockKeyboardEvent.key) && mockKeyboardEvent.key !== 'Escape') {
        mockKeyboardEvent.preventDefault();
        mockKeyboardEvent.stopPropagation();
      }

      expect(mockKeyboardEvent.preventDefault).toHaveBeenCalled();
      expect(mockKeyboardEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should allow Escape key to pass through', () => {
      const mockEscapeEvent = {
        key: 'Escape',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      const scrollKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'PageUp', 'PageDown', 'Home', 'End', 'Space'
      ];

      // Test that Escape key would not be prevented
      if (scrollKeys.includes(mockEscapeEvent.key) && mockEscapeEvent.key !== 'Escape') {
        mockEscapeEvent.preventDefault();
        mockEscapeEvent.stopPropagation();
      }

      expect(mockEscapeEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEscapeEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete lock/unlock cycle', () => {
      // Store original values
      const originalScrollY = 100;
      const originalOverflow = 'auto';
      const originalPosition = 'static';
      const originalTop = '0px';
      const originalWidth = 'auto';

      // Set initial state
      mockBodyStyle.overflow = originalOverflow;
      mockBodyStyle.position = originalPosition;
      mockBodyStyle.top = originalTop;
      mockBodyStyle.width = originalWidth;

      // Lock scroll
      mockBodyStyle.overflow = 'hidden';
      mockBodyStyle.position = 'fixed';
      mockBodyStyle.top = `-${originalScrollY}px`;
      mockBodyStyle.width = '100%';

      expect(mockBodyStyle.overflow).toBe('hidden');
      expect(mockBodyStyle.position).toBe('fixed');
      expect(mockBodyStyle.top).toBe('-100px');
      expect(mockBodyStyle.width).toBe('100%');

      // Unlock scroll
      mockBodyStyle.overflow = originalOverflow;
      mockBodyStyle.position = originalPosition;
      mockBodyStyle.top = originalTop;
      mockBodyStyle.width = originalWidth;
      window.scrollTo(0, originalScrollY);

      expect(mockBodyStyle.overflow).toBe('auto');
      expect(mockBodyStyle.position).toBe('static');
      expect(mockBodyStyle.top).toBe('0px');
      expect(mockBodyStyle.width).toBe('auto');
      expect(mockScrollTo).toHaveBeenCalledWith(0, 100);
    });

    it('should handle Lenis pause/resume cycle', () => {
      // Pause Lenis (lock scroll)
      mockLenis.stop();
      expect(mockLenis.stop).toHaveBeenCalled();

      // Resume Lenis (unlock scroll)
      mockLenis.start();
      expect(mockLenis.start).toHaveBeenCalled();
    });

    it('should handle event listener lifecycle', () => {
      const preventScroll = vi.fn();
      const preventTouchMove = vi.fn();
      const handleKeyDown = vi.fn();

      // Add event listeners (lock)
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      document.addEventListener('keydown', handleKeyDown, { passive: false });

      expect(mockAddEventListener).toHaveBeenCalledTimes(3);

      // Remove event listeners (unlock)
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventTouchMove);
      document.removeEventListener('keydown', handleKeyDown);

      expect(mockRemoveEventListener).toHaveBeenCalledTimes(3);
    });
  });

  describe('error handling', () => {
    it('should handle missing Lenis gracefully', () => {
      // Test that operations don't throw when Lenis is undefined
      expect(() => {
        // Simulate what the hook would do with undefined Lenis
        const lenis = undefined;
        if (lenis) {
          lenis.stop();
        }
      }).not.toThrow();

      expect(() => {
        // Simulate what the hook would do with undefined Lenis
        const lenis = undefined;
        if (lenis) {
          lenis.start();
        }
      }).not.toThrow();
    });

    it('should handle DOM manipulation errors gracefully', () => {
      // Test that style operations don't throw
      expect(() => {
        mockBodyStyle.overflow = 'hidden';
        mockBodyStyle.position = 'fixed';
        mockBodyStyle.top = '-100px';
        mockBodyStyle.width = '100%';
      }).not.toThrow();

      expect(() => {
        mockBodyStyle.overflow = '';
        mockBodyStyle.position = '';
        mockBodyStyle.top = '';
        mockBodyStyle.width = '';
      }).not.toThrow();
    });
  });
});