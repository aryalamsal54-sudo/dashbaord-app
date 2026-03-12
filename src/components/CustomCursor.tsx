import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Instant follow - no lerp/smoothing
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="custom-cursor fixed top-0 left-0 w-5 h-5 bg-white mix-blend-difference rounded-full pointer-events-none z-[9999] -ml-2.5 -mt-2.5"
    />
  );
}
