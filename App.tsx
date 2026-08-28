import React, { useState, useCallback, useEffect } from 'react';
// Remove .tsx and .ts extensions from relative imports
import { Calculator } from './components/Calculator';
import { Sidebar } from './components/Sidebar';
import { AiAssistant } from './components/AiAssistant';
import { Launchpad } from './components/Launchpad';
import { Settings } from './components/Settings';
import { NotesApp } from './components/NotesApp';
import { FormulaLab } from './components/FormulaLab';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CalculationHistory, ViewState, AppSettings, Note, SolverHistoryItem } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('launchpad');
  const [display, setDisplay] = useState('0');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [initialAiPrompt, setInitialAiPrompt] = useState<string | undefined>(undefined);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('calc_settings');
    return saved ? JSON.parse(saved) : {
      historyEnabled: true,
      retentionPeriod: 'forever',
      theme: 'dark'
    };
  });

  const [history, setHistory] = useState<CalculationHistory[]>(() => {
    const saved = localStorage.getItem('calc_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [solverHistory, setSolverHistory] = useState<SolverHistoryItem[]>(() => {
    const saved = localStorage.getItem('calc_solver_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global keyboard shortcut: Ctrl+K or Cmd+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('calc_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('calc_solver_history', JSON.stringify(solverHistory));
  }, [solverHistory]);

  const handleCalculate = useCallback((expression: string, result: string) => {
    if (settings.historyEnabled) {
      const newHistoryItem: CalculationHistory = {
        id: Math.random().toString(36).substr(2, 9),
        expression,
        result,
        timestamp: Date.now(),
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    }
    setDisplay(result);
  }, [settings.historyEnabled]);

  const clearAllStoredData = () => {
    setHistory([]);
    setSolverHistory([]);
    localStorage.removeItem('calc_history');
    localStorage.removeItem('calc_solver_history');
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('calc_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCalcHistory = () => {
    setHistory([]);
    localStorage.removeItem('calc_history');
  };

  const WorkspaceWrapper = ({ children, title, icon, onClear }: { children: React.ReactNode, title: string, icon: string, onClear?: () => void }) => (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <header className="bg-slate-900/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-slate-800 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('launchpad')}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all text-slate-400 hover:text-white"
            title="Back to Home"
          >
            <i className="fas fa-home"></i>
          </button>
          <div className="flex items-center gap-3">
            <i className={`fas ${icon} text-blue-400`}></i>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hidden sm:block">
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold border border-slate-700/50 flex items-center gap-2"
            title="Search functions, formulas & topics (Ctrl+K)"
          >
            <i className="fas fa-search text-blue-400"></i>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 font-mono">⌘K</kbd>
          </button>

          {onClear && (
            <button 
              onClick={onClear}
              className="p-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-bold uppercase tracking-wider border border-red-500/20"
            >
              Clear History
            </button>
          )}
          {view === 'workspace' && settings.historyEnabled && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 px-4 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-slate-700/50"
            >
              <i className="fas fa-history mr-2"></i> History
            </button>
          )}
          <button 
            onClick={() => setView('settings')}
            className="p-2 px-3 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden relative">
        {view === 'workspace' && settings.historyEnabled && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            history={history}
            onHistoryClick={(item) => setDisplay(item.expression)}
            onClearHistory={clearCalcHistory}
            onDeleteItem={deleteHistoryItem}
          />
        )}
        <main className="flex-1 overflow-hidden relative h-full">
          {children}
        </main>
      </div>

      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectFormula={(expr) => {
          setDisplay(expr);
          setView('workspace');
        }}
        onNavigate={(targetView) => setView(targetView)}
        onSolveWithAi={(problem) => {
          setInitialAiPrompt(problem);
          setView('workspace');
        }}
      />

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );

  if (view === 'launchpad') {
    return (
      <>
        <Launchpad 
          setView={setView} 
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        <GlobalSearchModal 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectFormula={(expr) => {
            setDisplay(expr);
            setView('workspace');
          }}
          onNavigate={(targetView) => setView(targetView)}
          onSolveWithAi={(problem) => {
            setInitialAiPrompt(problem);
            setView('workspace');
          }}
        />
      </>
    );
  }

  if (view === 'settings') {
    return (
      <Settings 
        settings={settings} 
        onUpdate={(s) => setSettings(prev => ({...prev, ...s}))} 
        onClearHistory={clearAllStoredData}
        onBack={() => setView('launchpad')} 
      />
    );
  }

  if (view === 'notes') {
    return (
      <WorkspaceWrapper title="Gemini Notes" icon="fa-sticky-note">
        <NotesApp />
      </WorkspaceWrapper>
    );
  }

  if (view === 'formulas') {
    return (
      <WorkspaceWrapper title="Formula Lab" icon="fa-flask">
        <FormulaLab onSelectFormula={(expr) => {
          setDisplay(expr);
          setView('workspace');
        }} />
      </WorkspaceWrapper>
    );
  }

  return (
    <WorkspaceWrapper 
      title="Gemini Calc-Pro" 
      icon="fa-calculator"
      onClear={solverHistory.length > 0 ? () => {
        setSolverHistory([]);
        localStorage.removeItem('calc_solver_history');
      } : undefined}
    >
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-12 relative overflow-y-auto custom-scrollbar h-full">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Calculator display={display} setDisplay={setDisplay} onCalculate={handleCalculate} />
          </div>
          <div className="lg:col-span-7 h-full">
            <AiAssistant 
              currentDisplay={display} 
              history={history} 
              solverHistory={solverHistory}
              onUpdateSolverHistory={setSolverHistory}
              initialPrompt={initialAiPrompt}
            />
          </div>
        </div>
      </div>
    </WorkspaceWrapper>
  );
};

export default App;