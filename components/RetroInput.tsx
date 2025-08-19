"use client";

import React from 'react';

// Classic Mac OS-style text input field
export const RetroInput = ({ 
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = "",
  maxLength
}: { 
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    maxLength={maxLength}
    className={`
      px-3 py-2 
      bg-white 
      border-2 border-black 
      font-mono text-sm
      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
      transition-colors duration-100
      ${className}
    `}
  />
);

// Text area component for longer text input
export const RetroTextArea = ({ 
  value,
  onChange,
  placeholder = "",
  disabled = false,
  rows = 4,
  className = ""
}: { 
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    rows={rows}
    className={`
      px-3 py-2 
      bg-white 
      border-2 border-black 
      font-mono text-sm
      resize-none
      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
      transition-colors duration-100
      ${className}
    `}
  />
);