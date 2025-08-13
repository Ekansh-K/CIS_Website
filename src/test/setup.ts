import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.scrollTo for tests
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
});