
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types.ts';

interface LaunchpadProps {
  setView: (view: ViewState) => void;
  onOpenSearch?: () => void;
}

export const Launchpad: React.FC<LaunchpadProps> = ({ setView, onOpenSearch }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const apps = [
    { id: 'workspace', name: 'Calculator', icon: 'fa-calculator', gradient: 'from-blue-500 to-indigo-700', glow: 'from-blue-400 to-indigo-600' },
    { id: 'chat', name: 'Assistant', icon: 'fa-robot', gradient: 'from-purple-500 to-pink-600', glow: 'from-purple-400 to-pink-500' },
    { id: 'notes', name: 'Notes', icon: 'fa-sticky-note', gradient: 'from-amber-400 to-orange-600', glow: 'from-amber-300 to-orange-500' },
    { id: 'formulas', name: 'Formula Lab', icon: 'fa-flask', gradient: 'from-emerald-500 to-teal-700', glow: 'from-emerald-400 to-teal-600' },
    { id: 'settings', name: 'Settings', icon: 'fa-cog', gradient: 'from-slate-600 to-slate-800', glow: 'from-slate-400 to-slate-600', spin: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
             <span className="text-blue-500">Workspace</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-medium">Professional AI-Powered Suite</p>
        </div>

        {/* Global Search Bar on Launchpad */}
        {onOpenSearch && (
          <div className="w-full max-w-md mb-12 animate-in fade-in duration-500">
            <button
              onClick={onOpenSearch}
              className="w-full px-5 py-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between text-slate-400 hover:text-slate-200 transition-all shadow-xl group"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-search text-blue-400 group-hover:scale-110 transition-transform"></i>
                <span className="text-sm font-medium">Search formulas, functions, topics...</span>
              </div>
              <kbd className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 font-mono">⌘K</kbd>
            </button>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-8 md:gap-14 max-w-4xl">
          {apps.map((app) => (
            <div key={app.id} className="flex flex-col items-center gap-4 group">
              <button 
                onClick={() => setView(app.id as ViewState)}
                className={`relative w-20 h-20 md:w-32 md:h-32 rounded-[1.8rem] md:rounded-[2.5rem] bg-gradient-to-br ${app.gradient} p-0.5 shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-active:scale-95 group-hover:rotate-2 group-hover:shadow-2xl`}
              >
                <div className="w-full h-full rounded-[1.7rem] md:rounded-[2.4rem] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center overflow-hidden">
                   <i className={`fas ${app.icon} text-3xl md:text-5xl text-white drop-shadow-lg ${app.spin ? 'animate-spin-slow' : ''}`}></i>
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${app.glow} rounded-[2rem] md:rounded-[2.6rem] blur opacity-0 group-hover:opacity-40 transition-opacity`}></div>
              </button>
              <span className="text-slate-400 font-bold text-xs md:text-base tracking-wide group-hover:text-white transition-colors">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Install Button bar */}
      <div className="absolute bottom-10 z-20 w-auto px-6 py-4 glass rounded-[2.5rem] flex gap-6 items-center animate-in slide-in-from-bottom-8 duration-1000">
         <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <i className="fas fa-mobile-screen text-lg"></i>
         </div>
         
         <button 
          onClick={handleInstall}
          className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all group ${deferredPrompt ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}`}
         >
           <i className={`fas ${deferredPrompt ? 'fa-download' : 'fa-circle-info'} group-hover:scale-110 transition-transform`}></i>
           <span className="text-[10px] font-black uppercase tracking-widest">
            {deferredPrompt ? 'Install App' : 'Add to Phone'}
           </span>
         </button>

         <div className="h-6 w-[1px] bg-slate-800"></div>

         <div className="flex gap-4">
            <i className="fas fa-wifi text-slate-700 text-sm" title="Offline Ready"></i>
            <i className="fas fa-lock text-slate-700 text-sm" title="Secure Workspace"></i>
         </div>
      </div>

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowInstallGuide(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white"
            >
              <i className="fas fa-times text-xl"></i>
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <i className="fas fa-mobile-button text-blue-400 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Install Gemini Calc</h2>
              <p className="text-slate-400 text-sm">Add this workspace to your home screen for a full-screen, app-like experience.</p>
            </div>

            <div className="space-y-6">
              {isIOS ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white">1</div>
                    <p className="text-sm text-slate-300">Tap the <i className="fas fa-share-square text-blue-400 mx-1"></i> <b>Share</b> button in Safari.</p>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white">2</div>
                    <p className="text-sm text-slate-300">Scroll down and tap <br/><b>Add to Home Screen</b> <i className="fas fa-plus-square text-slate-400 ml-1"></i></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white">1</div>
                    <p className="text-sm text-slate-300">Tap the <i className="fas fa-ellipsis-v text-slate-400 mx-1"></i> <b>Menu</b> icon in Chrome.</p>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white">2</div>
                    <p className="text-sm text-slate-300">Select <b>Install App</b> or <br/><b>Add to Home Screen</b>.</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
    </div>
  );
};
