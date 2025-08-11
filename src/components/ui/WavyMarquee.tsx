import React, { useEffect, useRef } from 'react';
import './WavyMarquee.css';

interface WavyMarqueeProps {
  text: string;
  className?: string;
}

const WavyMarquee: React.FC<WavyMarqueeProps> = ({ text, className = '' }) => {
  // Create a very long continuous text string for seamless loop
  const repeatedText = Array(100).fill(`${text} | `).join('');
  
  // Generate unique ID for each instance to avoid conflicts
  const uniqueId = React.useMemo(() => `wavePath-${Math.random().toString(36).substr(2, 9)}`, []);
  const animateRef = useRef<SVGAnimateElement>(null);
  
  // Force animation to start immediately when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animateRef.current) {
        animateRef.current.beginElement();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`wavy-marquee-container ${className}`}>
      <svg 
        className="w-full h-full" 
        viewBox="0 0 1000 200" 
        preserveAspectRatio="xMidYMid slice"
        style={{ 
          minWidth: '100vw', 
          minHeight: '100vh'
        }}
      >
        <defs>
          <path
            id={uniqueId}
            d="M0,100 Q250,50 500,100 T1000,100"
            fill="none"
          />
        </defs>
        
        <text className="wavy-text" textAnchor="start">
          <textPath 
            href={`#${uniqueId}`}
            startOffset="0%"
          >
            {repeatedText}
            <animate
              ref={animateRef}
              attributeName="startOffset"
              values="0%;-100%"
              dur="25s"
              repeatCount="indefinite"
              begin="indefinite"
              restart="always"
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default WavyMarquee;