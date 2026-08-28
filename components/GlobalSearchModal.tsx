import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types.ts';

export interface SearchResultItem {
  id: string;
  title: string;
  category: 'Function' | 'Formula' | 'AI Solver' | 'Topic' | 'Navigation';
  description: string;
  expression?: string;
  action: () => void;
  icon: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula: (expr: string) => void;
  onNavigate: (view: ViewState) => void;
  onSolveWithAi?: (problem: string) => void;
}

const SEARCH_DATABASE = [
  // Functions & Operations
  { id: 'fn-sin', title: 'Sine (sin)', category: 'Function' as const, description: 'Calculates the sine of an angle (supports DEG and RAD mode)', expression: 'sin(', icon: 'fa-wave-square' },
  { id: 'fn-cos', title: 'Cosine (cos)', category: 'Function' as const, description: 'Calculates the cosine of an angle (supports DEG and RAD mode)', expression: 'cos(', icon: 'fa-wave-square' },
  { id: 'fn-tan', title: 'Tangent (tan)', category: 'Function' as const, description: 'Calculates the tangent ratio (sin/cos)', expression: 'tan(', icon: 'fa-wave-square' },
  { id: 'fn-sqrt', title: 'Square Root (√)', category: 'Function' as const, description: 'Computes the principal square root of a number', expression: '√(', icon: 'fa-square-root-alt' },
  { id: 'fn-pow', title: 'Power / Exponent (^)', category: 'Function' as const, description: 'Raises base to an exponent e.g. 2^8', expression: '^', icon: 'fa-superscript' },
  { id: 'fn-fact', title: 'Factorial (!)', category: 'Function' as const, description: 'Multiplies series of descending integers e.g. 5! = 120', expression: '!', icon: 'fa-exclamation' },
  { id: 'fn-log', title: 'Logarithm Base 10 (log)', category: 'Function' as const, description: 'Common logarithm base 10 e.g. log(100) = 2', expression: 'log(', icon: 'fa-chart-line' },
  { id: 'fn-ln', title: 'Natural Logarithm (ln)', category: 'Function' as const, description: 'Logarithm to base e e.g. ln(e) = 1', expression: 'ln(', icon: 'fa-seedling' },
  { id: 'fn-pi', title: 'Pi Constant (π)', category: 'Function' as const, description: 'Mathematical constant π ≈ 3.1415926535', expression: 'π', icon: 'fa-circle-notch' },
  { id: 'fn-e', title: 'Euler Constant (e)', category: 'Function' as const, description: 'Base of natural logarithms e ≈ 2.718281828', expression: 'e', icon: 'fa-atom' },
  { id: 'fn-pct', title: 'Percentage (%)', category: 'Function' as const, description: 'Applies percentage multiplier e.g. 200 * 15%', expression: '%', icon: 'fa-percent' },

  // Formulas & Topics
  { id: 'top-quad', title: 'Quadratic Equation Solver', category: 'Topic' as const, description: 'Solve ax² + bx + c = 0 using quadratic formula', expression: 'x = (-b ± √(b² - 4ac)) / 2a', icon: 'fa-superscript' },
  { id: 'top-pyth', title: 'Pythagorean Theorem', category: 'Formula' as const, description: 'Right angle triangle relationship: a² + b² = c²', expression: 'a² + b² = c²', icon: 'fa-draw-polygon' },
  { id: 'top-deriv', title: 'Derivative & Product Rule', category: 'Topic' as const, description: 'Differentiation technique: (uv)′ = u′v + uv′', expression: 'd/dx[f(x)]', icon: 'fa-bolt' },
  { id: 'top-integ', title: 'Definite & Indefinite Integration', category: 'Topic' as const, description: 'Fundamental theorem of calculus and area under curve', expression: '∫ f(x) dx', icon: 'fa-infinity' },
  { id: 'top-bayes', title: 'Bayes Theorem & Conditional Probability', category: 'Topic' as const, description: 'P(A|B) = P(B|A)P(A) / P(B)', expression: 'P(A|B) = P(B|A)P(A)/P(B)', icon: 'fa-dice' },
  { id: 'top-matrix', title: '2×2 Matrix Determinant & Inverse', category: 'Topic' as const, description: 'Determinant |A| = ad - bc for linear algebra', expression: '|A| = ad - bc', icon: 'fa-table' },
  { id: 'top-circ', title: 'Circle Area & Circumference', category: 'Formula' as const, description: 'Area A = πr², Circumference C = 2πr', expression: 'A = πr²', icon: 'fa-circle' },
  { id: 'top-ohm', title: 'Ohm\'s Law (V = IR)', category: 'Formula' as const, description: 'Voltage equals current multiplied by resistance', expression: 'V = IR', icon: 'fa-bolt-lightning' },
  { id: 'top-ke', title: 'Kinetic Energy (1/2 mv²)', category: 'Formula' as const, description: 'Classical kinetic energy calculation', expression: 'KE = 1/2 mv²', icon: 'fa-person-running' },

  // AI Solver shortcuts
  { id: 'ai-quad', title: 'AI: Solve 2x² + 5x - 3 = 0', category: 'AI Solver' as const, description: 'Step-by-step quadratic equation breakdown', expression: 'Solve 2x^2 + 5x - 3 = 0', icon: 'fa-brain' },
  { id: 'ai-diff', title: 'AI: Find derivative of x³ · sin(x)', category: 'AI Solver' as const, description: 'Step-by-step product rule derivation', expression: 'Find derivative of f(x) = x^3 * sin(x)', icon: 'fa-brain' },
  { id: 'ai-int', title: 'AI: Integrate (3x² + 2x) dx from 0 to 2', category: 'AI Solver' as const, description: 'Definite integral step-by-step resolution', expression: 'Evaluate integral of (3x^2 + 2x) dx from 0 to 2', icon: 'fa-brain' },
  { id: 'ai-sys', title: 'AI: Solve system 2x + 3y = 12 and x - y = 1', category: 'AI Solver' as const, description: 'Simultaneous 2-variable linear system', expression: 'Solve system: 2x + 3y = 12 and x - y = 1', icon: 'fa-brain' },

  // Navigation
  { id: 'nav-calc', title: 'Open Calculator & Solver Workspace', category: 'Navigation' as const, description: 'Go to main scientific calculator and AI math assistant', icon: 'fa-calculator' },
  { id: 'nav-chat', title: 'Open AI Mathematics Tutor', category: 'Navigation' as const, description: 'Interactive Socratic chat for deep learning and proofs', icon: 'fa-robot' },
  { id: 'nav-notes', title: 'Open Study Notes App', category: 'Navigation' as const, description: 'Write, edit, and organize math formulas and ideas', icon: 'fa-sticky-note' },
  { id: 'nav-formulas', title: 'Open Formula Lab (100+ Formulas)', category: 'Navigation' as const, description: 'Browse and search complete curated formula reference', icon: 'fa-flask' },
  { id: 'nav-settings', title: 'Open System Settings', category: 'Navigation' as const, description: 'Configure history retention and privacy preferences', icon: 'fa-cog' },
];

export const GlobalSearchModal: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onSelectFormula,
  onNavigate,
  onSolveWithAi,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = SEARCH_DATABASE.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.expression && item.expression.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: typeof SEARCH_DATABASE[0]) => {
    if (item.category === 'Navigation') {
      if (item.id === 'nav-calc') onNavigate('workspace');
      else if (item.id === 'nav-chat') onNavigate('chat');
      else if (item.id === 'nav-notes') onNavigate('notes');
      else if (item.id === 'nav-formulas') onNavigate('formulas');
      else if (item.id === 'nav-settings') onNavigate('settings');
    } else if (item.category === 'AI Solver') {
      if (onSolveWithAi && item.expression) {
        onSolveWithAi(item.expression);
      } else if (item.expression) {
        onSelectFormula(item.expression);
        onNavigate('workspace');
      }
    } else if (item.expression) {
      onSelectFormula(item.expression);
      onNavigate('workspace');
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      } else if (query.trim() && onSolveWithAi) {
        onSolveWithAi(query);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center gap-3 bg-slate-900/90">
          <i className="fas fa-search text-blue-400 text-lg sm:text-xl ml-1"></i>
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search functions, formulas, topics, or type a math problem..."
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base sm:text-lg focus:outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 text-xs font-bold"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          <span className="text-[10px] uppercase font-mono font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700 hidden sm:inline-block">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-500 space-y-3">
              <i className="fas fa-magnifying-glass text-3xl opacity-30"></i>
              <p className="text-sm font-semibold">No direct match for "{query}"</p>
              {onSolveWithAi && (
                <button
                  onClick={() => {
                    onSolveWithAi(query);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  <i className="fas fa-magic mr-1.5"></i> Solve with AI Assistant
                </button>
              )}
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  idx === selectedIndex 
                    ? 'bg-blue-600/15 border border-blue-500/30 text-white shadow-sm' 
                    : 'bg-slate-950/40 hover:bg-slate-800/40 border border-transparent text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.category === 'Function' ? 'bg-blue-500/20 text-blue-400' :
                    item.category === 'Formula' ? 'bg-teal-500/20 text-teal-400' :
                    item.category === 'AI Solver' ? 'bg-purple-500/20 text-purple-400' :
                    item.category === 'Topic' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-700/30 text-slate-400'
                  }`}>
                    <i className={`fas ${item.icon} text-sm`}></i>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100 truncate">{item.title}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {item.expression && (
                    <span className="text-[11px] font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-emerald-400 hidden sm:inline-block">
                      {item.expression}
                    </span>
                  )}
                  <i className="fas fa-chevron-right text-slate-600 text-xs"></i>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>Use <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-400">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-400">↓</kbd> to navigate</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-400">ENTER</kbd> to select</span>
        </div>
      </div>
    </div>
  );
};
