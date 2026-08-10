import React from 'react';
import './DashboardBackground.css';

export default function DashboardBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden dash-bg-base text-[#F8FAFC] transition-colors duration-250 ${className}`}>
      {/* Nebulas */}
      <div className="dash-nebula"></div>
      <div className="dash-nebula-2"></div>
      
      {/* Scattered Starfield */}
      <div className="absolute inset-0 dash-stars pointer-events-none mix-blend-screen opacity-70"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {children}
      </div>
    </div>
  );
}
