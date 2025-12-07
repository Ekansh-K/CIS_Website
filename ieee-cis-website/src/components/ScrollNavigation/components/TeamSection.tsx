import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../../../lib/store'
import styles from '../styles/team-section.module.scss'

// Import team member images
import teamImage1 from '../../../assets/Team_Members/b4bbb2198b036fe1024571ec6b60f8b8.jpg'
import teamImage2 from '../../../assets/Team_Members/images.jpeg'

interface TeamMember {
  id: number
  name: string
  title: string
  image: string
}

interface TeamSectionProps {
  className?: string
}

// Team member data with placeholder names
const teamMembers: TeamMember[] = [
  { id: 1, name: '[Mentor Name]', title: 'Mentor', image: teamImage1 },
  { id: 2, name: '[President Name]', title: 'President', image: teamImage2 },
  { id: 3, name: '[Vice President Name]', title: 'Vice President', image: teamImage1 },
  { id: 4, name: '[Treasurer Name]', title: 'Treasurer', image: teamImage2 },
  { id: 5, name: '[Co Treasurer Name]', title: 'Co Treasurer', image: teamImage1 },
  { id: 6, name: '[Secretary Name]', title: 'Secretary', image: teamImage2 },
  { id: 7, name: '[Co Secretary Name]', title: 'Co Secretary', image: teamImage1 },
  { id: 8, name: '[Publicity Chair Name]', title: 'Publicity Chair', image: teamImage2 },
  { id: 9, name: '[Co Publicity Chair Name]', title: 'Co Publicity Chair', image: teamImage1 },
  { id: 10, name: '[Web Master Name]', title: 'Web Master', image: teamImage2 },
  { id: 11, name: '[Co Web Master Name]', title: 'Co Web Master', image: teamImage1 },
  { id: 12, name: '[Membership Dev Chair Name]', title: 'Membership Development Chair', image: teamImage2 },
  { id: 13, name: '[Co Membership Dev Chair Name]', title: 'Co Membership Development Chair', image: teamImage1 },
  { id: 14, name: '[Social Networking Chair Name]', title: 'Social Networking Chair', image: teamImage2 },
  { id: 15, name: '[Co Social Networking Chair Name]', title: 'Co Social Networking Chair', image: teamImage1 }
]

export const TeamSection: React.FC<TeamSectionProps> = ({ className = '' }) => {
  const { lenis } = useStore()
  const sectionRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(7) // Start with middle card focused (index 7 of 15 cards)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)

      // Calculate which card should be focused based on scroll position
      const cardWidth = 350 + 32 // Card width + gap (2rem = 32px)
      const scrollLeft = container.scrollLeft
      const containerWidth = container.clientWidth
      const centerPosition = scrollLeft + containerWidth / 2
      const newFocusedIndex = Math.round(centerPosition / cardWidth)
      
      setFocusedIndex(Math.max(0, Math.min(teamMembers.length - 1, newFocusedIndex)))

      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 100) // Reduced timeout for more responsive animations
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Auto-scroll to center the focused card
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || isScrolling) return

    const cardWidth = 350 + 32 // Card width + gap
    const containerWidth = container.clientWidth
    const targetScrollLeft = focusedIndex * cardWidth - containerWidth / 2 + (350 / 2)

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    })
  }, [focusedIndex, isScrolling])

  return (
    <section 
      id="team-section"
      ref={sectionRef}
      className={`${styles.teamSection} layout ${className}`}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Our Team</h2>
        </div>

        <div className={styles.scrollWrapper}>
          <div 
            ref={scrollContainerRef}
            className={styles.scrollContainer}
          >
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className={`${styles.teamCard} ${
                  index === focusedIndex ? styles.focused : styles.blurred
                }`}
                onClick={() => setFocusedIndex(index)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.imageContainer}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className={styles.memberImage}
                    />
                  </div>
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <p className={styles.memberTitle}>{member.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <p className={styles.scrollHint}>Scroll horizontally to explore our team</p>
        </div>
      </div>
    </section>
  )
}

export default TeamSection