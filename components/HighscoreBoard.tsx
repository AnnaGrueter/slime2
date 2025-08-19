"use client";

import React from 'react';

// High Score entry interface
interface HighScoreEntry {
  name: string;
  score: number;
}

interface HighscoreBoardProps {
  scores?: HighScoreEntry[];
  onClose: () => void;
  onClear?: () => void;
  className?: string;
  style?: React.CSSProperties;  // 👈 Add this line
}

const HighscoreBoard = ({
  scores = [],
  onClose,
  onClear,
  className,
  style
}: HighscoreBoardProps) => {
  // Ensure we always have exactly 10 entries
  const defaultScores: HighScoreEntry[] = Array.from({ length: 10 }, () => ({ 
    name: "Nobody", 
    score: 0 
  }));
  
  const displayScores = [...scores];
  while (displayScores.length < 10) {
    displayScores.push({ name: "Nobody", score: 0 });
  }
  displayScores.splice(10); // Keep only first 10

  const handleCloseClick = () => {
    onClose();
  };

  const handleCloseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div 
    className={`bg-white border-4 border-black shadow-lg ${className || ""}`}
    style={{ width: "500px", height: "400px", ...style }}
  >
      {/* Background Image */}
      <img
        src="/components/art/ui/highscores.png"
        alt="High Scores Background"
        className="absolute inset-0 w-full h-full"
        style={{ 
          imageRendering: 'pixelated',
          objectFit: 'fill'
        }}
        draggable={false}
      />
      
      {/* Close Button */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={handleCloseClick}
        onKeyDown={handleCloseKeyDown}
        className="absolute cursor-pointer border-2 border-black bg-white hover:bg-gray-100"
        style={{
          top: '9px',
          left: '23px',
          width: '20px',
          height: '18px'
        }}
      >
        <div className="flex items-center justify-center w-full h-full text-xs font-bold">
          ×
        </div>
      </div>
      
      {/* Score Entries Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {displayScores.map((entry, index) => {
          const yPosition = 60 + index * 34;
          return (
            <div key={index} className="absolute font-mono text-lg text-black">
              {/* Name - left aligned at x=40 */}
              <div
                className="absolute"
                style={{
                  left: '40px',
                  top: `${yPosition}px`
                }}
              >
                {entry.name}
              </div>
              
              {/* Score - right aligned at x=520 */}
              <div
                className="absolute"
                style={{
                  left: '520px',
                  top: `${yPosition}px`,
                  transform: 'translateX(-100%)'
                }}
              >
                {entry.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};