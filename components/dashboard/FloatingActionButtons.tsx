
import React from 'react';

interface FloatingActionButtonsProps {
  onReset: () => void;
  onZaiChat: (message?: string) => void;
  onSettings: () => void;
}

export function FloatingActionButtons({ onReset, onZaiChat, onSettings }: FloatingActionButtonsProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          
          {/* Settings Button - Left */}
          <button 
            onClick={onSettings}
            className="zz-action-button pointer-events-auto"
            title="Settings"
          >
            ≡
          </button>
          
          {/* Zai Chat Button - Center */}
          <button 
            onClick={() => onZaiChat()}
            className="zz-action-button zz-action-button-primary pointer-events-auto"
            title="Ask Zai"
          >
            ○
          </button>
          
          {/* Reset Button - Right */}
          <button 
            onClick={onReset}
            className="zz-action-button pointer-events-auto"
            title="Reset"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
