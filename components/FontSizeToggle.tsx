"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FontSizeToggle({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(16);

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(event.target.value));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Adjust font size</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <div className="w-full">
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
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
