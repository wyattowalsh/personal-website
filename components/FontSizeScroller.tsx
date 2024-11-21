"use client";

import React, { useState } from "react";

export default function FontSizeScroller({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(16);

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(event.target.value));
  };

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
      <div className="flex justify-end mb-4">
        <label htmlFor="font-size-slider" className="mr-2">Font Size:</label>
        <input
          id="font-size-slider"
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="w-32"
        />
      </div>
      {children}
    </div>
  );
}
