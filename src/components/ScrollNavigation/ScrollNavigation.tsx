import React from 'react'

interface ScrollNavigationProps {
  children?: React.ReactNode
}

const ScrollNavigation: React.FC<ScrollNavigationProps> = ({ children }) => {
  return (
    <div className="scroll-navigation">
      {children}
    </div>
  )
}

export default ScrollNavigation