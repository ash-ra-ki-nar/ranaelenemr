import React from 'react';
import './WavyMarquee.css';

interface WavyMarqueeProps {
  text: string;
  className?: string;
}

const WavyMarquee: React.FC<WavyMarqueeProps> = ({ text, className = '' }) => {
  // Create a very long continuous text string for seamless loop
  const repeatedText = Array(100).fill(`${text} | `).join('');

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
            id="wavePath"
            d="M0,100 Q250,50 500,100 T1000,100"
            fill="none"
          />
        </defs>
        
        <text className="wavy-text" textAnchor="start">
          <textPath 
            href="#wavePath"
            startOffset="0%"
          >
            {repeatedText}
            <animate
              attributeName="startOffset"
              values="0%;-100%"
              dur="25s"
              repeatCount="indefinite"
              begin="0s"
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default WavyMarquee;