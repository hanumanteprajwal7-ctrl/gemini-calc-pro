
import React from 'react';
import { CalculationHistory } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  history: CalculationHistory[];
  onHistoryClick: (item: CalculationHistory) => void;
  onClearHistory?: () => void;
  onDeleteItem?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  history, 
  onHistoryClick,
  onClearHistory,
  onDeleteItem
}) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <i className="fas fa-calculator text-white text-xl"></i>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Calc-Pro</h1>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden text-slate-500 hover:text-slate-300 p-2"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recent History</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {history.length}
                </span>
                {history.length > 0 && onClearHistory && (
                  <button
                    onClick={onClearHistory}
                    className="text-[10px] text-red-400/80 hover:text-red-400 font-bold uppercase tracking-wider hover:underline"
                    title="Clear calculation history"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-center gap-2">
                <i className="fas fa-history text-3xl opacity-20"></i>
                <p className="text-sm">No calculations yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group relative cursor-pointer"
                    onClick={() => onHistoryClick(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-xs text-slate-400 mb-1 group-hover:text-blue-400 transition-colors truncate flex-1 pr-2 font-mono">
                        {item.expression}
                      </div>
                      {onDeleteItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity p-1 text-xs"
                          title="Delete from history"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                    </div>
                    <div className="text-base font-mono font-bold text-slate-200 truncate">
                      = {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
                <i className="fas fa-sparkles text-blue-400"></i>
                <span>Gemini 3.7 Flash Engine</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

