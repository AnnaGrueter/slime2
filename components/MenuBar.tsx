"use client";

import React, { useState } from 'react';
import { AppleIcon } from 'lucide-react';

interface MenuBarProps {
  onMenuStateChange?: (isOpen: boolean) => void;
  onNewGame?: () => void;
  onToggleSound?: () => void;
  onTogglePause?: () => void;
  onShowAbout?: () => void;
  onShowIntroduction?: () => void;
  onShowHelp?: () => void;
  onShowEnemies?: () => void;
  onShowHighScores?: () => void;
  onClearHighScores?: () => void;
  soundOn?: boolean;
  isPaused?: boolean;
}

// Apple menu component with classic Mac styling
const AppleMenu = ({ 
  isOpen, 
  onToggle, 
  onShowAbout 
}: { 
  isOpen: boolean; 
  onToggle: () => void;
  onShowAbout?: () => void;
}) => (
  <div className="relative">
    <button 
      onClick={onToggle}
      className={`px-2 py-1 text-black hover:bg-black hover:text-white ${isOpen ? 'bg-black text-white' : ''} transition-colors duration-100`}
    >
      <AppleIcon size={16} fill="currentColor" />
    </button>
    {isOpen && (
      <div className="absolute top-full left-0 bg-white border-2 border-black shadow-lg z-50 min-w-[200px]">
        <div className="py-1">
          <button 
            onClick={onShowAbout}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            About Slimeinvaders
          </button>
        </div>
      </div>
    )}
  </div>
);

// File menu component
const FileMenu = ({ 
  isOpen, 
  onToggle,
  onShowIntroduction,
  onShowHelp,
  onShowEnemies
}: { 
  isOpen: boolean; 
  onToggle: () => void;
  onShowIntroduction?: () => void;
  onShowHelp?: () => void;
  onShowEnemies?: () => void;
}) => (
  <div className="relative">
    <button 
      onClick={onToggle}
      className={`px-3 py-1 font-mono text-black hover:bg-black hover:text-white ${isOpen ? 'bg-black text-white' : ''} transition-colors duration-100`}
    >
      File
    </button>
    {isOpen && (
      <div className="absolute top-full left-0 bg-white border-2 border-black shadow-lg z-50 min-w-[200px]">
        <div className="py-1">
          <button 
            onClick={onShowIntroduction}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            Introduction
          </button>
          <button 
            onClick={onShowHelp}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            Help
          </button>
          <button 
            onClick={onShowEnemies}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            Show Enemies
          </button>
        </div>
      </div>
    )}
  </div>
);

// Game menu component
const GameMenu = ({ 
  isOpen, 
  onToggle,
  onNewGame,
  onToggleSound,
  onTogglePause,
  soundOn,
  isPaused
}: { 
  isOpen: boolean; 
  onToggle: () => void;
  onNewGame?: () => void;
  onToggleSound?: () => void;
  onTogglePause?: () => void;
  soundOn?: boolean;
  isPaused?: boolean;
}) => (
  <div className="relative">
    <button 
      onClick={onToggle}
      className={`px-3 py-1 font-mono text-black hover:bg-black hover:text-white ${isOpen ? 'bg-black text-white' : ''} transition-colors duration-100`}
    >
      Game
    </button>
    {isOpen && (
      <div className="absolute top-full left-0 bg-white border-2 border-black shadow-lg z-50 min-w-[200px]">
        <div className="py-1">
          <button 
            onClick={onNewGame}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            New Game
          </button>
          <button 
            onClick={onToggleSound}
            className="flex justify-between items-center w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            <span>Sound</span>
            <span>{soundOn ? '✓' : ''}</span>
          </button>
          <button 
            onClick={onTogglePause}
            className="flex justify-between items-center w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
            <span className="font-light text-xs">Space</span>
          </button>
        </div>
      </div>
    )}
  </div>
);

// High Scores menu component
const HighScoresMenu = ({ 
  isOpen, 
  onToggle,
  onShowHighScores,
  onClearHighScores
}: { 
  isOpen: boolean; 
  onToggle: () => void;
  onShowHighScores?: () => void;
  onClearHighScores?: () => void;
}) => (
  <div className="relative">
    <button 
      onClick={onToggle}
      className={`px-3 py-1 font-mono text-black hover:bg-black hover:text-white ${isOpen ? 'bg-black text-white' : ''} transition-colors duration-100`}
    >
      High Scores
    </button>
    {isOpen && (
      <div className="absolute top-full left-0 bg-white border-2 border-black shadow-lg z-50 min-w-[200px]">
        <div className="py-1">
          <button 
            onClick={onShowHighScores}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            Show High Scores
          </button>
          <button 
            onClick={onClearHighScores}
            className="block w-full text-left px-4 py-1 hover:bg-black hover:text-white font-mono text-sm"
          >
            Clear High Scores
          </button>
        </div>
      </div>
    )}
  </div>
);

// Main MenuBar component that combines all menu items
export const MenuBar = ({
  onMenuStateChange,
  onNewGame,
  onToggleSound,
  onTogglePause,
  onShowAbout,
  onShowIntroduction,
  onShowHelp,
  onShowEnemies,
  onShowHighScores,
  onClearHighScores,
  soundOn = true,
  isPaused = false
}: MenuBarProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMenuToggle = (menuName: string) => {
    const newOpenMenu = openMenu === menuName ? null : menuName;
    setOpenMenu(newOpenMenu);
    if (onMenuStateChange) {
      onMenuStateChange(newOpenMenu !== null);
    }
  };

  const handleClickOutside = () => {
    setOpenMenu(null);
    if (onMenuStateChange) {
      onMenuStateChange(false);
    }
  };

  const handleMenuAction = (action?: () => void) => {
    if (action) action();
    setOpenMenu(null);
    if (onMenuStateChange) {
      onMenuStateChange(false);
    }
  };

  return (
    <>
      {openMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClickOutside}
        />
      )}
      <div className="bg-white border-b-2 border-black flex items-center h-8 relative z-50">
        <div className="flex items-center">
          <AppleMenu 
            isOpen={openMenu === 'apple'} 
            onToggle={() => handleMenuToggle('apple')}
            onShowAbout={() => handleMenuAction(onShowAbout)}
          />
          <FileMenu 
            isOpen={openMenu === 'file'} 
            onToggle={() => handleMenuToggle('file')}
            onShowIntroduction={() => handleMenuAction(onShowIntroduction)}
            onShowHelp={() => handleMenuAction(onShowHelp)}
            onShowEnemies={() => handleMenuAction(onShowEnemies)}
          />
          <GameMenu 
            isOpen={openMenu === 'game'} 
            onToggle={() => handleMenuToggle('game')}
            onNewGame={() => handleMenuAction(onNewGame)}
            onToggleSound={() => handleMenuAction(onToggleSound)}
            onTogglePause={() => handleMenuAction(onTogglePause)}
            soundOn={soundOn}
            isPaused={isPaused}
          />
          <HighScoresMenu 
            isOpen={openMenu === 'highscores'} 
            onToggle={() => handleMenuToggle('highscores')}
            onShowHighScores={() => handleMenuAction(onShowHighScores)}
            onClearHighScores={() => handleMenuAction(onClearHighScores)}
          />
        </div>
      </div>
    </>
  );
};