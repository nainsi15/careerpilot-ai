import React from 'react';
import './GalaxyBackground.css';

export default function GalaxyBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden galaxy-base ${className}`}>
      {/* Scattered Starfield */}
      <div className="absolute inset-0 bg-stars opacity-50 mix-blend-screen pointer-events-none"></div>
      
      {/* Shooting Star/Comet */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shooting-star"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
