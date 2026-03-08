import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'text'>('default');
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Snappy spring config for the trailing glass effect
  const springConfig = { damping: 20, stiffness: 300, mass: 0.2 };
  const glassX = useSpring(cursorX, springConfig);
  const glassY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const moveMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName?.toLowerCase();
      
      if (tagName === 'input' || tagName === 'textarea') {
        setCursorState('text');
        return;
      }

      const isClickable = 
        window.getComputedStyle(target).cursor === 'pointer' ||
        tagName === 'a' ||
        tagName === 'button' ||
        target.closest('a') ||
        target.closest('button');
      
      setCursorState(isClickable ? 'hover' : 'default');
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const variants = {
    default: { 
      width: 32, 
      height: 32, 
      borderRadius: '50%',
      backgroundColor: '#ffffff',
    },
    hover: { 
      width: 64, 
      height: 64, 
      borderRadius: '50%', 
      backgroundColor: '#ffffff',
    },
    text: { 
      width: 4, 
      height: 24, 
      borderRadius: '4px',
      backgroundColor: '#ffffff',
    }
  };

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
      
      {/* Glass trailing circle */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center"
        style={{
          x: glassX,
          y: glassY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          scale: isClicking ? 0.8 : 1,
          mixBlendMode: 'difference'
        }}
        animate={cursorState}
        variants={variants}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    </>
  );
}
