
import React, { useState } from 'react';
import { AppSettings } from '../types.ts';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearHistory, onBack }) => {
  const [clearingState, setClearingState] = useState<'idle' | 'confirming' | 'cleared'>('idle');

  const handleClear = () => {
    if (clearingState === 'idle') {
      setClearingState('confirming');
      setTimeout(() => {
        setClearingState(prev => prev === 'confirming' ? 'idle' : prev);
      }, 5000);
    } else if (clearingState === 'confirming') {
      onClearHistory();
      setClearingState('cleared');
      setTimeout(() => {
        setClearingState('idle');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-800/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-2xl z-10">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
            <p className="text-slate-500 font-medium uppercase text-xs tracking-widest mt-1">Preferences & Privacy</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* History Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <i className="fas fa-history"></i>
              </div>
              <h2 className="text-xl font-bold text-white">Calculation & AI History</h2>
            </div>

            <div className="space-y-6">
              {/* Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div>
                  <p className="text-slate-200 font-semibold">Enable History Tracking</p>
                  <p className="text-xs text-slate-500">Automatically save your calculations and solutions</p>
                </div>
                <button 
                  onClick={() => onUpdate({ historyEnabled: !settings.historyEnabled })}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings.historyEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${settings.historyEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              {/* Retention Period */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Retention Period</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '1 Week', value: '1week' },
                    { label: '1 Month', value: '1month' },
                    { label: '3 Months', value: '3months' },
                    { label: 'Forever', value: 'forever' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdate({ retentionPeriod: opt.value as any })}
                      className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${settings.retentionPeriod === opt.value 
                        ? 'bg-blue-600/10 border-blue-600 text-blue-400 shadow-lg shadow-blue-500/5' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Action */}
              <div className="pt-4 mt-4 border-t border-slate-800/50 flex flex-col gap-2">
                <button 
                  onClick={handleClear}
                  className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    clearingState === 'cleared'
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                      : clearingState === 'confirming'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  {clearingState === 'cleared' && (
                    <>
                      <i className="fas fa-check-circle"></i>
                      <span>All History & AI Data Cleared!</span>
                    </>
                  )}
                  {clearingState === 'confirming' && (
                    <>
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>Confirm: Click to permanently delete all history</span>
                    </>
                  )}
                  {clearingState === 'idle' && (
                    <>
                      <i className="fas fa-trash-alt"></i>
                      <span>Clear All History Data</span>
                    </>
                  )}
                </button>
                {clearingState === 'confirming' && (
                  <p className="text-[11px] text-center text-slate-500">
                    This will delete all calculator records, AI assistant solver results, and chatbot conversations.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl opacity-80">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <i className="fas fa-info-circle"></i>
              </div>
              <h2 className="text-xl font-bold text-white">About Calc-Pro</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gemini Calc-Pro is a high-performance calculation engine integrated with Google's advanced Gemini 3.7 Flash AI model to provide step-by-step mathematical reasoning and solutions.
            </p>
            <div className="mt-4 flex gap-4 text-xs text-slate-500 font-mono">
              <span>Version: 2.1.0-pro</span>
              <span>Kernel: Gemini 3.7 Flash</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

