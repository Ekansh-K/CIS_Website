import React from 'react';
import type { SimplifiedLetterProps } from '../types';
import styles from '../styles/intro.module.scss';
import CSvgUrl from '../../../assets/Icons/C.svg';

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
        <img
          src={CSvgUrl}
          alt="Letter C"
          className="w-full h-full"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
    </div>
  );
};

export default LetterC;