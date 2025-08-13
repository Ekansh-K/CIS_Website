import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LetterI from '../LetterI';

describe('LetterI', () => {
  it('renders the letter I SVG correctly', () => {
    render(<LetterI />);
    
    const svg = screen.getByRole('img', { name: 'Letter I' });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('applies correct CSS index for 125ms delay (--index: 1)', () => {
    render(<LetterI style={{ '--index': '1' } as React.CSSProperties} />);
    
    const container = screen.getByTestId('letter-i-container');
    expect(container.style.getPropertyValue('--index')).toBe('1');
    expect(container).toHaveAttribute('data-index', '1');
  });

  it('applies CSS classes correctly', () => {
    const className = 'logoGroup show';
    render(<LetterI className={className} />);
    
    const container = screen.getByTestId('letter-i-container');
    expect(container.className).toBe(className);
  });

  it('applies custom styles correctly', () => {
    const style = { '--index': '1', color: 'blue' } as React.CSSProperties;
    render(<LetterI style={style} />);
    
    const container = screen.getByTestId('letter-i-container');
    expect(container.style.getPropertyValue('--index')).toBe('1');
    expect(container.style.color).toBe('blue');
  });

  it('has onTransitionEnd event handler attached', () => {
    const onTransitionEnd = vi.fn();
    render(<LetterI onTransitionEnd={onTransitionEnd} />);
    
    const container = screen.getByTestId('letter-i-container');
    
    // Simulate transitionend event
    fireEvent.transitionEnd(container);
    
    expect(onTransitionEnd).toHaveBeenCalledTimes(1);
    expect(onTransitionEnd).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles transition events correctly', () => {
    const onTransitionEnd = vi.fn();
    render(<LetterI onTransitionEnd={onTransitionEnd} />);
    
    const container = screen.getByTestId('letter-i-container');
    
    // Simulate multiple transitionend events
    fireEvent.transitionEnd(container);
    fireEvent.transitionEnd(container);
    
    expect(onTransitionEnd).toHaveBeenCalledTimes(2);
  });

  it('has correct accessibility attributes', () => {
    render(<LetterI />);
    
    const svg = screen.getByRole('img', { name: 'Letter I' });
    expect(svg).toHaveAttribute('aria-label', 'Letter I');
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('renders SVG rectangles with currentColor fill', () => {
    const { container } = render(<LetterI />);
    
    const rects = container.querySelectorAll('rect');
    expect(rects).toHaveLength(3);
    rects.forEach(rect => {
      expect(rect).toHaveAttribute('fill', 'currentColor');
    });
  });

  it('renders correct SVG structure for letter I', () => {
    const { container } = render(<LetterI />);
    
    const rects = container.querySelectorAll('rect');
    expect(rects).toHaveLength(3);
    
    // Top bar
    expect(rects[0]).toHaveAttribute('x', '35');
    expect(rects[0]).toHaveAttribute('y', '25');
    expect(rects[0]).toHaveAttribute('width', '30');
    expect(rects[0]).toHaveAttribute('height', '10');
    
    // Middle bar (vertical)
    expect(rects[1]).toHaveAttribute('x', '45');
    expect(rects[1]).toHaveAttribute('y', '35');
    expect(rects[1]).toHaveAttribute('width', '10');
    expect(rects[1]).toHaveAttribute('height', '30');
    
    // Bottom bar
    expect(rects[2]).toHaveAttribute('x', '35');
    expect(rects[2]).toHaveAttribute('y', '65');
    expect(rects[2]).toHaveAttribute('width', '30');
    expect(rects[2]).toHaveAttribute('height', '10');
  });
});