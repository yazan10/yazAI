import React from 'react';
import { MODELS } from '../constants';
import { ModelId } from '../types';
import { Brain, Sparkles, MessageCircle, Menu, X, Globe, Trash2, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const IconMap: Record<string, React.FC<any>> = {
  Brain: Brain,
  Sparkles: Sparkles,
  MessageCircle: MessageCircle
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentModel, 
  onSelectModel, 
  onClearHistory,
  isOpen, 
  onClose 
}) => {
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 right-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a] border-l border-white/5
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0 md:static md:w-80 flex flex-col shadow-2xl
      `}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
          {/* Subtle background glow in header */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Globe className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Yaz AI</h1>
              <p className="text-xs text-blue-400 font-medium tracking-wide">ياز للذكاء الاصطناعي</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2 px-2 mb-2">
             <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
             <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">اختر النموذج</span>
             <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent"></div>
          </div>
          
          {MODELS.map((model) => {
            const Icon = IconMap[model.icon];
            const isSelected = currentModel === model.id;
            
            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`
                  relative w-full flex items-center gap-4 p-4 rounded-2xl border text-right group overflow-hidden
                  transition-all duration-300 ease-out
                  ${isSelected 
                    ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]' 
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20'}
                `}
              >
                {/* Selection Indicator Line */}
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-l-full bg-blue-500 blur-[2px] transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* Shimmer Effect on Hover */}
                {!isSelected && (
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                )}

                <div className={`
                  p-3 rounded-xl transition-all duration-300 flex-shrink-0
                  ${isSelected 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                    : 'bg-[#1e293b] text-slate-400 group-hover:text-white group-hover:bg-slate-700 shadow-inner'}
                `}>
                  <Icon size={22} strokeWidth={isSelected ? 2 : 1.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-sm mb-1 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {model.name}
                  </div>
                  <div className={`text-[10px] leading-relaxed transition-colors duration-300 truncate ${isSelected ? 'text-blue-300/80' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {model.description}
                  </div>
                </div>

                {/* Arrow for selected state */}
                {isSelected && (
                  <ChevronRight size={16} className="text-blue-400 opacity-50 absolute left-4 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-4 bg-gradient-to-t from-black/20 to-transparent">
          <button 
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/5 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-red-500/10 hover:border-red-500/20 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Trash2 size={16} className="group-hover:scale-110 transition-transform relative z-10" />
            <span className="text-sm font-medium relative z-10">مسح المحادثة</span>
          </button>

          <div className="bg-gradient-to-br from-[#1e293b]/50 to-[#0f172a]/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors duration-500"></div>
            <p className="text-[10px] text-center text-gray-500 leading-relaxed relative z-10">
              جميع النماذج تعمل بواسطة محاكاة متقدمة عبر محرك <span className="text-blue-400 font-bold glow">ياز سلاق</span> لتوفير خدمة مجانية.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};