import React from 'react';
import type { SimplifiedLetterProps } from '../types';
import styles from '../styles/intro.module.scss';
import SSvgUrl from '../../../assets/Icons/S.svg';

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
        <img
          src={SSvgUrl}
          alt="Letter S"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
    </div>
  );
};

export default LetterS;