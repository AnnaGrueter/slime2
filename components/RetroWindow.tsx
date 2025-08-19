"use client";

import React from 'react';

// Classic Mac window frame component
export const RetroWindow = ({ 
  title,
  children,
  className = "",
  onClose
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) => (
  <div className={`bg-white border-2 border-black shadow-lg ${className}`}>
    {title && (
      <div className="bg-white border-b border-black px-4 py-2 flex justify-between items-center">
        <h2 className="font-mono text-sm font-bold">{title}</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-4 h-4 bg-white border border-black hover:bg-gray-100 flex items-center justify-center text-xs font-bold"
          >
            ×
          </button>
        )}
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Dialog box component with OK/Cancel buttons
export const RetroDialog = ({ 
  title,
  message,
  onOk,
  onCancel,
  isOpen = true
}: {
  title: string;
  message: string;
  onOk?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <RetroWindow title={title} className="min-w-[300px]">
        <div className="mb-6">
          <p className="font-mono text-sm">{message}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onOk}
            className="px-8 py-2 bg-white border-2 border-black font-mono text-sm font-bold hover:bg-gray-100"
          >
            OK
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white border-2 border-black font-mono text-sm font-bold hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </RetroWindow>
    </div>
  );
};