import React, { forwardRef } from 'react';

interface SharedLetterProps {
  letter: 'C' | 'I' | 'S';
  svgUrl: string;
  className?: string;
  style?: React.CSSProperties;
  onTransitionEnd?: (event: React.TransitionEvent) => void;
  'data-letter-id'?: string;
}

const SharedLetter = forwardRef<HTMLDivElement, SharedLetterProps>(({
  letter,
  svgUrl,
  className = '',
  style,
  onTransitionEnd,
  'data-letter-id': dataLetterId,
  ...props
}, ref) => {
  return (
    <div 
      ref={ref}
      className={className}
      style={style}
      onTransitionEnd={onTransitionEnd}
      data-letter-id={dataLetterId}
      data-letter={letter}
      {...props}
    >
      <img
        src={svgUrl}
        alt={`Letter ${letter}`}
        className="w-full h-full"
        style={{ filter: 'brightness(0) invert(1)' }}
        draggable={false}
      />
    </div>
  );
});

SharedLetter.displayName = 'SharedLetter';

export default SharedLetter;