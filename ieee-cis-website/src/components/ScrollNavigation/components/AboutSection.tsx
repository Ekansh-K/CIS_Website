import React from 'react'
import { useAboutSection } from '../hooks/useAboutSection'
import styles from '../styles/about-section.module.scss'

interface AboutPoint {
  id: string
  title: string
  description: string
  icon: string
}

const cisAboutPoints: AboutPoint[] = [
  {
    id: 'mission',
    title: 'Our Mission',
    description: 'IEEE CIS advances computational intelligence and systems science, fostering innovation in neural networks, fuzzy systems, and evolutionary computation.',
    icon: '🎯'
  },
  {
    id: 'community',
    title: 'Global Community',
    description: 'Connecting over 5,000 researchers, practitioners, and students worldwide through conferences, publications, and collaborative research initiatives.',
    icon: '🌐'
  },
  {
    id: 'research',
    title: 'Cutting-edge Research',
    description: 'Publishing leading research in computational intelligence through our prestigious journals and sponsoring world-class conferences.',
    icon: '🔬'
  },
  {
    id: 'education',
    title: 'Educational Excellence',
    description: 'Providing educational resources, workshops, and certification programs to advance knowledge in computational intelligence fields.',
    icon: '📚'
  }
]

interface AboutSectionProps {
  scrollProgress?: number
  className?: string
}

/**
 * AboutSection Component
 * 
 * Inspired by Lenis "Why Smooth Scroll" section with sticky left content
 * and progressive right content reveals. Uses CSS sticky positioning
 * and large vertical spacing to create the "held in place" effect.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ 
  className = '' 
}) => {
  const {
    sectionRef,
    aboutState,
    scrollProgress,
    isInSection,
    getPointProgress,
    getContentProgress
  } = useAboutSection({
    pointCount: cisAboutPoints.length,
    revealThreshold: 0.6,
    contentThreshold: 0.8
  })

  return (
    <section 
      ref={sectionRef}
      className={`${styles.aboutSection} layout ${className}`}
    >
      {/* Sticky left content */}
      <div className={styles.sticky}>
        <h2 className={styles.title}>About IEEE-CIS</h2>
        <p className={styles.description}>
          The IEEE Computational Intelligence Society leads the world in advancing 
          the theory, design, and application of computational intelligence. We bring 
          together brilliant minds to solve complex problems and push the boundaries 
          of what's possible.
        </p>
        

      </div>

      {/* Progressive right content */}
      <div className={styles.features}>
        {cisAboutPoints.map((point, index) => {
          const pointProgress = getPointProgress(index)
          const isRevealed = index < aboutState.pointsRevealed
          const isActive = index === aboutState.activePoint
          
          return (
            <div 
              key={point.id} 
              data-testid={`feature-${point.id}`}
              className={`${styles.feature} ${
                isRevealed ? styles.revealed : ''
              } ${
                isActive ? styles.active : ''
              }`}
              style={{
                '--point-progress': pointProgress,
                opacity: isRevealed ? 1 : 0.3,
                transform: `translateY(${isRevealed ? 0 : 40}px)`
              } as React.CSSProperties}
            >
              <div className={styles.featureIcon}>
                {point.icon}
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{point.title}</h3>
                <p className={styles.featureDescription}>{point.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default AboutSection