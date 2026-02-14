import React from 'react';
import { Loader2 } from 'lucide-react';

interface TransitionLoaderProps {
  modelName?: string;
}

export const TransitionLoader: React.FC<TransitionLoaderProps> = ({ modelName }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-in fade-in duration-300">
      {/* Foggy/Blurry Background */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md transition-all"></div>

      {/* Old iPhone Style HUD Box */}
      <div className="relative bg-[#202020]/80 backdrop-blur-xl w-48 h-48 rounded-3xl flex flex-col items-center justify-center shadow-2xl ring-1 ring-white/10 transform animate-in zoom-in-95 duration-200">
        
        {/* iOS Style Activity Indicator */}
        <div className="mb-4 relative">
          <Loader2 className="w-14 h-14 text-white/90 animate-spin" />
        </div>

        <span className="text-white/90 font-medium text-sm tracking-wide">جاري التحويل...</span>
        
        {modelName && (
          <span className="text-white/50 text-[10px] mt-2 font-light px-4 text-center truncate w-full">
            {modelName}
          </span>
        )}
      </div>
    </div>
  );
};
