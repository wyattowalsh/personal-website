"use client";

import React, { createContext, useContext, useRef } from 'react';

type MathContextType = {
  getNextNumber: () => number;
  resetCounter: () => void;
};

const MathContext = createContext<MathContextType | null>(null);

export function MathProvider({ children }: { children: React.ReactNode }) {
  // Use useRef instead of useState to avoid async state updates
  const counterRef = useRef(0);

  const getNextNumber = () => {
    counterRef.current += 1;
    return counterRef.current;
  };

  const resetCounter = () => {
    counterRef.current = 0;
  };

  return (
    <MathContext.Provider value={{ getNextNumber, resetCounter }}>
      {children}
    </MathContext.Provider>
  );
}

export const useMathContext = () => {
  const context = useContext(MathContext);
  if (!context) {
    throw new Error('useMathContext must be used within a MathProvider');
  }
  return context;
};
