import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LetterS from '../LetterS';

describe('LetterS', () => {
  it('renders the letter S SVG correctly', () => {
    render(<LetterS />);
    
    const svg = screen.getByRole('img', { name: 'Letter S' });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('applies correct CSS index for 250ms delay (--index: 2)', () => {
    render(<LetterS style={{ '--index': '2' } as React.CSSProperties} />);
    
    const container = screen.getByTestId('letter-s-container');
    expect(container.style.getPropertyValue('--index')).toBe('2');
    expect(container).toHaveAttribute('data-index', '2');
  });

  it('applies CSS classes correctly', () => {
    const className = 'logoGroup show';
    render(<LetterS className={className} />);
    
    const container = screen.getByTestId('letter-s-container');
    expect(container.className).toBe(className);
  });

  it('applies custom styles correctly', () => {
    const style = { '--index': '2', color: 'green' } as React.CSSProperties;
    render(<LetterS style={style} />);
    
    const container = screen.getByTestId('letter-s-container');
    expect(container.style.getPropertyValue('--index')).toBe('2');
    expect(container.style.color).toBe('green');
  });

  it('has onTransitionEnd event handler attached', () => {
    const onTransitionEnd = vi.fn();
    render(<LetterS onTransitionEnd={onTransitionEnd} />);
    
    const container = screen.getByTestId('letter-s-container');
    
    // Simulate transitionend event
    fireEvent.transitionEnd(container);
    
    expect(onTransitionEnd).toHaveBeenCalledTimes(1);
    expect(onTransitionEnd).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles transition events correctly', () => {
    const onTransitionEnd = vi.fn();
    render(<LetterS onTransitionEnd={onTransitionEnd} />);
    
    const container = screen.getByTestId('letter-s-container');
    
    // Simulate multiple transitionend events
    fireEvent.transitionEnd(container);
    fireEvent.transitionEnd(container);
    
    expect(onTransitionEnd).toHaveBeenCalledTimes(2);
  });

  it('has correct accessibility attributes', () => {
    render(<LetterS />);
    
    const svg = screen.getByRole('img', { name: 'Letter S' });
    expect(svg).toHaveAttribute('aria-label', 'Letter S');
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('renders SVG path with currentColor fill', () => {
    const { container } = render(<LetterS />);
    
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('fill', 'currentColor');
  });

  it('renders complex S-shaped path correctly', () => {
    const { container } = render(<LetterS />);
    
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d');
    
    // Verify the path data contains the expected S-shape commands
    const pathData = path?.getAttribute('d');
    expect(pathData).toContain('M75 25'); // Move to start
    expect(pathData).toContain('C'); // Curve commands for S shape
  });
});