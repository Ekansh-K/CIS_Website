import React from 'react';
import type { SimplifiedLetterProps } from '../types';
import styles from '../styles/intro.module.scss';
import ISvgUrl from '../../../assets/Icons/I.svg';

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
        <img
          src={ISvgUrl}
          alt="Letter I"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
    </div>
  );
};

export default LetterI;