"use client";

import React from 'react';

// Checkered pattern background component to simulate classic Mac desktop
export const CheckeredBackground = ({ 
  children,
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <div 
    className={`min-h-screen ${className}`}
    style={{
      backgroundImage: `
        linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
      `,
      backgroundSize: '4px 4px',
      backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
    }}
  >
    {children}
  </div>
);

// Dotted pattern component for window backgrounds
export const DottedPattern = ({ 
  children,
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <div 
    className={`${className}`}
    style={{
      backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
      backgroundSize: '8px 8px'
    }}
  >
    {children}
  </div>
);