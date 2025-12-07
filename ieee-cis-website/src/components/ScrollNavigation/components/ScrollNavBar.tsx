import React, { useCallback, useEffect } from 'react'
import { useStore } from '../../../lib/store'
import { useScrollProgress } from '../hooks/useScrollProgress'
import styles from '../styles/scroll.module.scss'
import { Home, Info, Users } from 'lucide-react'

interface ScrollNavBarProps {
  className?: string
}

export const ScrollNavBar: React.FC<ScrollNavBarProps> = ({ className = '' }) => {
  const { 
    lenis, 
    showNavigation, 
    activeSection, 
    setShowNavigation, 
    setActiveSection 
  } = useStore()
  const scrollProgress = useScrollProgress()

  // Calculate navigation visibility based on scroll progress
  const navZone = scrollProgress.zones.navAppear
  const isVisible = showNavigation || (navZone && navZone.isActive)
  const opacity = navZone ? Math.max(navZone.progress, showNavigation ? 1 : 0) : (showNavigation ? 1 : 0)



  // Update store navigation visibility
  useEffect(() => {
    const shouldShow = navZone && navZone.progress > 0.1
    if (shouldShow !== showNavigation) {
      setShowNavigation(shouldShow)
    }
  }, [navZone, showNavigation, setShowNavigation])

  // Smooth scroll to sections using Lenis
  const scrollToSection = useCallback((targetId: string, section: 'hero' | 'about' | 'team') => {
    setActiveSection(section)

    if (!lenis) return

    if (targetId === 'top') {
      lenis.scrollTo(0, {
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 3) // easeOutCubic
      })
      return
    }

    // For about section, scroll to the AboutSection component
    if (targetId === 'about') {
      const aboutElement = document.querySelector('[class*="aboutSection"]')
      if (aboutElement) {
        lenis.scrollTo(aboutElement as HTMLElement, {
          duration: 1.2,
          offset: -100, // Offset for better positioning
          easing: (t: number) => 1 - Math.pow(1 - t, 3) // easeOutCubic
        })
        return
      }
    }

    const element = document.getElementById(targetId)
    if (element) {
      lenis.scrollTo(element, {
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 3) // easeOutCubic
      })
    }
  }, [lenis, setActiveSection])

  const handleHomeClick = useCallback(() => {
    scrollToSection('top', 'hero')
  }, [scrollToSection])

  const handleAboutClick = useCallback(() => {
    scrollToSection('about', 'about')
  }, [scrollToSection])

  const handleTeamClick = useCallback(() => {
    scrollToSection('team-section', 'team')
  }, [scrollToSection])

  const handleLogoClick = useCallback(() => {
    scrollToSection('top', 'hero')
  }, [scrollToSection])

  // Transform for smooth appearance animation
  const transform = `translateY(${(1 - opacity) * -20}px)`

  return (
    <nav
      className={`${styles.navBar} ${isVisible ? styles.visible : ''} ${className}`}
      style={{
        opacity,
        transform,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Logo slot - will be filled by 3D logo transition */}
          <div 
            className={styles.logoSlot}
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            aria-label="Scroll to top"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleLogoClick()
              }
            }}
          >
            <div 
              id="nav-logo-slot" 
              data-testid="nav-logo-slot"
              className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center"
              aria-hidden="true"
            >
              {/* 3D logo will be positioned here via absolute positioning */}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className={styles.navButtons}>
            <button
              onClick={handleHomeClick}
              className={`${styles.navButton} ${activeSection === 'hero' ? styles.active : ''}`}
              aria-label="Navigate to Home section"
            >
              <Home className={styles.buttonIcon} size={16} />
              Home
            </button>
            
            <button
              onClick={handleAboutClick}
              className={`${styles.navButton} ${activeSection === 'about' ? styles.active : ''}`}
              aria-label="Navigate to About Us section"
            >
              <Info className={styles.buttonIcon} size={16} />
              About Us
            </button>
            
            <button
              onClick={handleTeamClick}
              className={`${styles.navButton} ${activeSection === 'team' ? styles.active : ''}`}
              aria-label="Navigate to Our Team section"
            >
              <Users className={styles.buttonIcon} size={16} />
              Our Team
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ScrollNavBar