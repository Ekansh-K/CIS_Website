import React from 'react';
import type { SimplifiedLetterProps } from '../types';
import styles from '../styles/intro.module.scss';

const LetterS: React.FC<SimplifiedLetterProps> = ({
  className = '',
  style,
  onTransitionEnd
}) => {
  return (
    <div 
      className={`${className}`}
      style={style}
      onTransitionEnd={onTransitionEnd}
      data-testid="letter-s-container"
      data-index="2"
    >
      <div className={styles.letter}>
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Letter S"
          role="img"
        >
          <path
            d="M75 25 C85 25, 90 30, 90 40 C90 45, 87 47, 82 47 L35 47 C30 47, 28 49, 28 52 C28 55, 30 57, 35 57 L75 57 C85 57, 90 62, 90 72 C90 82, 85 87, 75 87 L25 87 C15 87, 10 82, 10 72 L15 72 C15 77, 18 82, 25 82 L75 82 C80 82, 82 80, 82 77 C82 74, 80 72, 75 72 L25 72 C15 72, 10 67, 10 57 C10 47, 15 42, 25 42 L75 42 C80 42, 82 40, 82 37 C82 34, 80 32, 75 32 L25 32 C18 32, 15 37, 15 42 L10 42 C10 32, 15 25, 25 25 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};

export default LetterS;