import React from 'react';
import type { SimplifiedLetterProps } from '../types';
import styles from '../styles/intro.module.scss';

const LetterC: React.FC<SimplifiedLetterProps> = ({
  className = '',
  style,
  onTransitionEnd
}) => {
  return (
    <div 
      className={`${className}`}
      style={style}
      onTransitionEnd={onTransitionEnd}
      data-testid="letter-c-container"
      data-index="0"
    >
      <div className={styles.letter}>
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Letter C"
          role="img"
        >
          <path
            d="M75 25 C85 25, 90 30, 90 40 L85 40 C85 35, 82 30, 75 30 L35 30 C25 30, 20 35, 20 45 L20 55 C20 65, 25 70, 35 70 L75 70 C82 70, 85 65, 85 60 L90 60 C90 70, 85 75, 75 75 L35 75 C20 75, 15 70, 15 55 L15 45 C15 30, 20 25, 35 25 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default LetterC;