import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LetterC from '../LetterC';

describe('LetterC', () => {
  it('renders the letter C SVG correctly', () => {
    render(<LetterC />);
    
    const svg = screen.getByRole('img', { name: 'Letter C' });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('applies correct CSS index for immediate start (--index: 0)', () => {
    render(<LetterC style={{ '--index': '0' } as React.CSSProperties} />);
    
    const container = screen.getByTestId('letter-c-container');
    expect(container.style.getPropertyValue('--index')).toBe('0');
    expect(container).toHaveAttribute('data-index', '0');
  });

  it('applies CSS classes correctly', () => {
    const className = 'logoGroup show';
    render(<LetterC className={className} />);
    
    const container = screen.getByTestId('letter-c-container');
    expect(container.className).toBe(className);
  });

  it('applies custom styles correctly', () => {
    const style = { '--index': '0', color: 'red' } as React.CSSProperties;
    render(<LetterC style={style} />);
    
    const container = screen.getByTestId('letter-c-container');
    expect(container.style.getPropertyValue('--index')).toBe('0');
    expect(container.style.color).toBe('red');
  });

  it('has onTransitionEnd event handler attached', () => {
    const onTransitionEnd = vi.fn();
    render(<LetterC onTransitionEnd={onTransitionEnd} />);
    
    const container = screen.getByTestId('letter-c-container');
    
    // Simulate transitionend event
    fireEvent.transitionEnd(container);
    
    expect(onTransitionEnd).toHaveBeenCalledTimes(1);
    expect(onTransitionEnd).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles transition events correctly', () => {
    const onTransitionEnd = vi.fn();
    render(<LetterC onTransitionEnd={onTransitionEnd} />);
    
    const container = screen.getByTestId('letter-c-container');
    
    // Simulate multiple transitionend events
    fireEvent.transitionEnd(container);
    fireEvent.transitionEnd(container);
    
    expect(onTransitionEnd).toHaveBeenCalledTimes(2);
  });

  it('has correct accessibility attributes', () => {
    render(<LetterC />);
    
    const svg = screen.getByRole('img', { name: 'Letter C' });
    expect(svg).toHaveAttribute('aria-label', 'Letter C');
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('renders SVG path with currentColor fill', () => {
    const { container } = render(<LetterC />);
    
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('fill', 'currentColor');
  });
});