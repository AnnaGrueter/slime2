"use client";

import React, { useState } from 'react';
import { RetroWindow } from './RetroWindow';
import { RetroInput } from './RetroInput';
import { OkButton, CancelButton } from './RetroButtons';

// High Score entry interface
interface HighScoreEntry {
  rank: number;
  name: string;
  score: number;
  date?: string;
}

// High Score display window component
export const HighScoreWindow = ({ 
  isOpen = true,
  onClose,
  scores = []
}: {
  isOpen?: boolean;
  onClose?: () => void;
  scores?: HighScoreEntry[];
}) => {
  if (!isOpen) return null;

  // Default high scores if none provided
  const defaultScores: HighScoreEntry[] = [
    { rank: 1, name: "Alice", score: 15420, date: "12-15-95" },
    { rank: 2, name: "Bob", score: 12350, date: "12-14-95" },
    { rank: 3, name: "Charlie", score: 11200, date: "12-13-95" },
    { rank: 4, name: "Diana", score: 10800, date: "12-12-95" },
    { rank: 5, name: "Eve", score: 9750, date: "12-11-95" },
    { rank: 6, name: "Frank", score: 8900, date: "12-10-95" },
    { rank: 7, name: "Grace", score: 8200, date: "12-09-95" },
    { rank: 8, name: "Henry", score: 7500, date: "12-08-95" },
    { rank: 9, name: "Ivy", score: 6800, date: "12-07-95" },
    { rank: 10, name: "Jack", score: 6100, date: "12-06-95" }
  ];

  const displayScores = scores.length > 0 ? scores : defaultScores;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <RetroWindow title="High Scores" onClose={onClose} className="min-w-[400px]">
        <div className="mb-6">
          <div className="bg-white border-2 border-black p-4">
            <div className="grid grid-cols-4 gap-2 font-mono text-sm font-bold border-b-2 border-black pb-2 mb-2">
              <div>Rank</div>
              <div>Name</div>
              <div>Score</div>
              <div>Date</div>
            </div>
            <div className="space-y-1">
              {displayScores.map((entry) => (
                <div key={entry.rank} className="grid grid-cols-4 gap-2 font-mono text-sm">
                  <div>{entry.rank}</div>
                  <div>{entry.name}</div>
                  <div>{entry.score.toLocaleString()}</div>
                  <div>{entry.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <OkButton onClick={onClose} />
        </div>
      </RetroWindow>
    </div>
  );
};

// High Score add/entry window component
export const HighScoreAddWindow = ({ 
  isOpen = true,
  onOk,
  onCancel,
  score,
  message = "You made the top 10 list!"
}: {
  isOpen?: boolean;
  onOk?: (name: string) => void;
  onCancel?: () => void;
  score?: number;
  message?: string;
}) => {
  const [playerName, setPlayerName] = useState("Ruby 15-7-26");

  if (!isOpen) return null;

  const handleOk = () => {
    if (onOk) {
      onOk(playerName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border-4 border-black shadow-lg min-w-[500px] p-6">
        {/* Decorative border pattern */}
        <div className="border-2 border-black p-6">
          <div className="text-center mb-8">
            <h2 className="font-mono text-lg font-bold mb-4">{message}</h2>
            {score && (
              <p className="font-mono text-sm mb-4">Score: {score.toLocaleString()}</p>
            )}
            <p className="font-mono text-sm mb-6">Please enter your name:</p>
            
            <div className="flex justify-center mb-8">
              <RetroInput
                value={playerName}
                onChange={setPlayerName}
                className="w-64 text-center"
                maxLength={20}
              />
            </div>
            
            <div className="flex gap-6 justify-center">
              <OkButton onClick={handleOk} />
              <CancelButton onClick={onCancel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};