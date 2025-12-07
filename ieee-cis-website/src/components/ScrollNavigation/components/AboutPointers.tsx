// Placeholder for AboutPointers component - will be implemented in task 6
import React from 'react'

interface AboutPoint {
  id: string
  text: string
  description?: string
  revealProgress: number
}

interface AboutPointersProps {
  points: AboutPoint[]
  activeIndex: number
  scrollProgress: number
}

const AboutPointers: React.FC<AboutPointersProps> = ({ 
  points, 
  activeIndex, 
  scrollProgress 
}) => {
  return (
    <div className="about-pointers">
      {/* Implementation will be added in task 6 */}
    </div>
  )
}

export default AboutPointers
export { AboutPointers, type AboutPoint }