import React from 'react';
import type { SimplifiedLetterProps } from '../types';
import styles from '../styles/intro.module.scss';

const LetterI: React.FC<SimplifiedLetterProps> = ({
  className = '',
  style,
  onTransitionEnd
}) => {
  return (
    <div 
      className={`${className}`}
      style={style}
      onTransitionEnd={onTransitionEnd}
      data-testid="letter-i-container"
      data-index="1"
    >
      <div className={styles.letter}>
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Letter I"
          role="img"
        >
          <rect
            x="35"
            y="25"
            width="30"
            height="10"
            fill="currentColor"
          />
          <rect
            x="45"
            y="35"
            width="10"
            height="30"
            fill="currentColor"
          />
          <rect
            x="35"
            y="65"
            width="30"
            height="10"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default LetterI;