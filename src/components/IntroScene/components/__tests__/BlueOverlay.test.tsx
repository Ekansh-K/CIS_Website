// Test file for BlueOverlay component
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock GSAP before importing the component
vi.mock('gsap', () => {
  const mockTimeline = {
    to: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    play: vi.fn().mockReturnThis(),
    kill: vi.fn()
  };

  return {
    gsap: {
      timeline: vi.fn(() => mockTimeline),
      set: vi.fn(),
      to: vi.fn()
    }
  };
});

// Mock CSS modules
vi.mock('../styles/intro.module.scss', () => ({
  default: {
    blueOverlay: 'blueOverlay'
  }
}));

import BlueOverlay from '../BlueOverlay';

describe('BlueOverlay', () => {
  const mockOnRevealComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the blue overlay element', () => {
    render(
      <BlueOverlay
        isVisible={true}
        onRevealComplete={mockOnRevealComplete}
      />
    );

    const overlay = screen.getByTestId('blue-overlay');
    expect(overlay).toBeInTheDocument();
    // CSS modules generate hashed class names, so we check for the presence of any class
    expect(overlay.className).toBeTruthy();
  });

  it('creates GSAP timeline on mount', async () => {
    const { gsap } = await import('gsap');
    
    render(
      <BlueOverlay
        isVisible={true}
        onRevealComplete={mockOnRevealComplete}
      />
    );

    expect(gsap.timeline).toHaveBeenCalledWith({
      paused: true,
      onComplete: expect.any(Function)
    });
  });

  it('sets initial GSAP state on mount', async () => {
    const { gsap } = await import('gsap');
    
    render(
      <BlueOverlay
        isVisible={true}
        onRevealComplete={mockOnRevealComplete}
      />
    );

    expect(gsap.set).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      {
        scale: 1,
        opacity: 1,
        transformOrigin: 'center center'
      }
    );
  });

  it('handles reduced motion preference', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <BlueOverlay
        isVisible={false}
        onRevealComplete={mockOnRevealComplete}
      />
    );

    expect(mockOnRevealComplete).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <BlueOverlay
        isVisible={true}
        onRevealComplete={mockOnRevealComplete}
      />
    );

    const overlay = screen.getByTestId('blue-overlay');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });
});