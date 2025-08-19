"use client";

import React from 'react';

// Small Button component with compact styling
export const SmallButton = ({ 
  children,
  onClick, 
  disabled = false,
  className = "" 
}: { 
  children: React.ReactNode;
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-3 py-1 
      bg-white 
      border-2 border-black 
      font-mono text-xs font-bold
      hover:bg-gray-100 
      active:bg-gray-200
      disabled:text-gray-400 disabled:cursor-not-allowed
      focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1
      transition-colors duration-100
      ${className}
    `}
  >
    {children}
  </button>
);

// Big Button component with larger styling and rounded corners
export const BigButton = ({ 
  children,
  onClick, 
  disabled = false,
  className = "" 
}: { 
  children: React.ReactNode;
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-12 py-4 
      bg-white 
      border-4 border-black 
      rounded-lg
      font-mono text-lg font-bold
      hover:bg-gray-100 
      active:bg-gray-200
      disabled:text-gray-400 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      transition-colors duration-100
      shadow-lg
      ${className}
    `}
  >
    {children}
  </button>
);

// OK Button component with classic Mac styling
export const OkButton = ({ 
  onClick, 
  disabled = false,
  className = "" 
}: { 
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-8 py-2 
      bg-white 
      border-2 border-black 
      font-mono text-sm font-bold
      hover:bg-gray-100 
      active:bg-gray-200
      disabled:text-gray-400 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      transition-colors duration-100
      ${className}
    `}
  >
    OK
  </button>
);

// Cancel Button component with classic Mac styling
export const CancelButton = ({ 
  onClick, 
  disabled = false,
  className = "" 
}: { 
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-6 py-2 
      bg-white 
      border-2 border-black 
      font-mono text-sm font-bold
      hover:bg-gray-100 
      active:bg-gray-200
      disabled:text-gray-400 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      transition-colors duration-100
      ${className}
    `}
  >
    Cancel
  </button>
);

// Button Group component for OK/Cancel pairs
export const ButtonGroup = ({ 
  onOk, 
  onCancel, 
  okDisabled = false, 
  cancelDisabled = false 
}: {
  onOk?: () => void;
  onCancel?: () => void;
  okDisabled?: boolean;
  cancelDisabled?: boolean;
}) => (
  <div className="flex gap-4 justify-center">
    <OkButton onClick={onOk} disabled={okDisabled} />
    <CancelButton onClick={onCancel} disabled={cancelDisabled} />
  </div>
);