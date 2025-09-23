'use client';

import React, { useState, useEffect } from 'react';
import CommandPalette from './CommandPalette';

interface CommandPaletteWrapperProps {
  children: React.ReactNode;
}

export default function CommandPaletteWrapper({ children }: CommandPaletteWrapperProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut ⇧⌘K (Shift+Cmd+K su Mac, Shift+Ctrl+K su Windows/Linux)
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key === 'K') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
