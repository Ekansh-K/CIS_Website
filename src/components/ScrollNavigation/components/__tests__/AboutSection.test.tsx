import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AboutSection } from '../AboutSection'
import { useAboutSection } from '../../hooks/useAboutSection'

// Mock the useAboutSection hook
vi.mock('../../hooks/useAboutSection')

describe('AboutSection', () => {
  const mockAboutSection = {
    sectionRef: { current: null },
    aboutState: {
      pointsRevealed: 2,
      showContent: false,
      activePoint: 1
    },
    scrollProgress: 0.5,
    isInSection: true,
    getPointProgress: vi.fn((index: number) => index < 2 ? 1 : 0),
    getContentProgress: vi.fn(() => 0)
  }

  beforeEach(() => {
    vi.mocked(useAboutSection).mockReturnValue(mockAboutSection)
  })

  it('should render AboutSection component', () => {
    render(<AboutSection />)
    
    expect(screen.getByText('About IEEE-CIS')).toBeInTheDocument()
    expect(screen.getByText(/The IEEE Computational Intelligence Society/)).toBeInTheDocument()
  })

  it('should render all about points', () => {
    render(<AboutSection />)
    
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
    expect(screen.getByText('Global Community')).toBeInTheDocument()
    expect(screen.getByText('Cutting-edge Research')).toBeInTheDocument()
    expect(screen.getByText('Educational Excellence')).toBeInTheDocument()
  })

  it('should apply revealed class to revealed points', () => {
    render(<AboutSection />)
    
    const missionFeature = screen.getByTestId('feature-mission')
    const communityFeature = screen.getByTestId('feature-community')
    
    // First two points should be revealed (pointsRevealed: 2)
    // Check for CSS module class names (they will be hashed)
    expect(missionFeature.className).toContain('revealed')
    expect(communityFeature.className).toContain('revealed')
  })

  it('should apply active class to active point', () => {
    render(<AboutSection />)
    
    const communityFeature = screen.getByTestId('feature-community')
    expect(communityFeature.className).toContain('active')
  })

  it('should not show main content when showContent is false', () => {
    render(<AboutSection />)
    
    expect(screen.queryByText('Join Our Community')).not.toBeInTheDocument()
  })

  it('should show main content when showContent is true', () => {
    const mockWithContent = {
      ...mockAboutSection,
      aboutState: {
        ...mockAboutSection.aboutState,
        showContent: true
      },
      getContentProgress: vi.fn(() => 1)
    }
    
    vi.mocked(useAboutSection).mockReturnValue(mockWithContent)
    
    render(<AboutSection />)
    
    expect(screen.getByText('Join Our Community')).toBeInTheDocument()
    expect(screen.getByText('5,000+ Members')).toBeInTheDocument()
    expect(screen.getByText('50+ Countries')).toBeInTheDocument()
    expect(screen.getByText('Leading Research')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<AboutSection className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('layout', 'custom-class')
  })

  it('should call useAboutSection with correct options', () => {
    render(<AboutSection />)
    
    expect(useAboutSection).toHaveBeenCalledWith({
      pointCount: 4,
      revealThreshold: 0.6,
      contentThreshold: 0.8
    })
  })

  it('should apply inline styles based on progress', () => {
    render(<AboutSection />)
    
    // Check that getPointProgress is called for each feature (may be called multiple times due to React renders)
    expect(mockAboutSection.getPointProgress).toHaveBeenCalledWith(0)
    expect(mockAboutSection.getPointProgress).toHaveBeenCalledWith(1)
    expect(mockAboutSection.getPointProgress).toHaveBeenCalledWith(2)
    expect(mockAboutSection.getPointProgress).toHaveBeenCalledWith(3)
  })

  it('should handle different scroll progress states', () => {
    const mockNoProgress = {
      ...mockAboutSection,
      aboutState: {
        pointsRevealed: 0,
        showContent: false,
        activePoint: -1
      },
      scrollProgress: 0,
      isInSection: false,
      getPointProgress: vi.fn(() => 0),
      getContentProgress: vi.fn(() => 0)
    }
    
    vi.mocked(useAboutSection).mockReturnValue(mockNoProgress)
    
    render(<AboutSection />)
    
    // No points should be revealed
    const missionFeature = screen.getByTestId('feature-mission')
    const communityFeature = screen.getByTestId('feature-community')
    
    expect(missionFeature.className).not.toContain('revealed')
    expect(missionFeature.className).not.toContain('active')
    expect(communityFeature.className).not.toContain('revealed')
    expect(communityFeature.className).not.toContain('active')
  })

  it('should handle complete progress state', () => {
    const mockCompleteProgress = {
      ...mockAboutSection,
      aboutState: {
        pointsRevealed: 4,
        showContent: true,
        activePoint: 3
      },
      scrollProgress: 1,
      isInSection: true,
      getPointProgress: vi.fn(() => 1),
      getContentProgress: vi.fn(() => 1)
    }
    
    vi.mocked(useAboutSection).mockReturnValue(mockCompleteProgress)
    
    render(<AboutSection />)
    
    // All points should be revealed
    const missionFeature = screen.getByTestId('feature-mission')
    const communityFeature = screen.getByTestId('feature-community')
    const researchFeature = screen.getByTestId('feature-research')
    const educationFeature = screen.getByTestId('feature-education')
    
    expect(missionFeature.className).toContain('revealed')
    expect(communityFeature.className).toContain('revealed')
    expect(researchFeature.className).toContain('revealed')
    expect(educationFeature.className).toContain('revealed')
    
    // Last point should be active
    expect(educationFeature.className).toContain('active')
    
    // Main content should be visible
    expect(screen.getByText('Join Our Community')).toBeInTheDocument()
  })
})