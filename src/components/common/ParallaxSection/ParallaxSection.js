import React, { useEffect, useRef, useState } from 'react';
import './ParallaxSection.css';

const ParallaxSection = ({ 
  children, 
  speed = 0.5, 
  className = '',
  style = {}
}) => {
  const [offset, setOffset] = useState(0);
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const rect = parallaxRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        setOffset(parallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return (
    <div
      ref={parallaxRef}
      className={`parallax-section ${className}`}
      style={{
        transform: `translateY(${offset}px)`,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;

