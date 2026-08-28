
import React, { useState } from 'react';
import { MathEngine } from '../services/mathEngine.ts';

interface CalculatorProps {
  display: string;
  setDisplay: (val: string) => void;
  onCalculate: (expr: string, res: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ display, setDisplay, onCalculate }) => {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'standard' | 'scientific'>('scientific');
  const [isDegree, setIsDegree] = useState(true);

  const append = (val: string) => {
    // If we're showing an error, replace it immediately when typing a new character
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const clear = () => {
    setDisplay('0');
    setLastResult(null);
  };

  const backspace = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const calculate = () => {
    if (!display || display === '0' || display === 'Error') return;

    const evalRes = MathEngine.evaluate(display, isDegree);
    if (evalRes.success && evalRes.result !== undefined) {
      const resultStr = evalRes.result;
      onCalculate(display, resultStr);
      setLastResult(resultStr);
      setDisplay(resultStr);
    } else {
      console.warn("Calculation Error:", evalRes.error);
      setDisplay('Error');
    }
  };

  const scientificButtons = [
    { label: isDegree ? 'DEG' : 'RAD', action: () => setIsDegree(!isDegree), type: 'fn', specialText: true },
    { label: 'sin', val: 'sin(', type: 'fn' },
    { label: 'cos', val: 'cos(', type: 'fn' },
    { label: 'tan', val: 'tan(', type: 'fn' },
    { label: 'π', val: 'π', type: 'fn' },
    { label: 'e', val: 'e', type: 'fn' },
    { label: 'ln', val: 'ln(', type: 'fn' },
    { label: 'log', val: 'log(', type: 'fn' },
    { label: '√', val: '√(', type: 'fn' },
    { label: '^', val: '^', type: 'fn' },
    { label: '(', val: '(', type: 'fn' },
    { label: ')', val: ')', type: 'fn' },
  ];

  const standardButtons = [
    { label: 'C', action: clear, type: 'clear' },
    { label: '⌫', action: backspace, type: 'clear' },
    { label: '%', val: '%', type: 'op' },
    { label: '÷', val: '÷', type: 'op' },
    { label: '7', val: '7', type: 'num' },
    { label: '8', val: '8', type: 'num' },
    { label: '9', val: '9', type: 'num' },
    { label: '×', val: '×', type: 'op' },
    { label: '4', val: '4', type: 'num' },
    { label: '5', val: '5', type: 'num' },
    { label: '6', val: '6', type: 'num' },
    { label: '-', val: '-', type: 'op' },
    { label: '1', val: '1', type: 'num' },
    { label: '2', val: '2', type: 'num' },
    { label: '3', val: '3', type: 'num' },
    { label: '+', val: '+', type: 'op' },
    { label: '0', val: '0', type: 'num', wide: mode === 'standard' },
    { label: '.', val: '.', type: 'num' },
    ...(mode === 'scientific' ? [{ label: '!', val: '!', type: 'op' }] : []),
    { label: '=', action: calculate, type: 'equal' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl w-full flex flex-col">
      {/* Mode & Angle Switcher */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('scientific')}
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              mode === 'scientific' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Scientific
          </button>
          <button
            onClick={() => setMode('standard')}
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              mode === 'standard' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Basic
          </button>
        </div>

        {mode === 'scientific' && (
          <button
            onClick={() => setIsDegree(!isDegree)}
            className="text-[11px] font-mono font-bold px-3 py-1 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-blue-400 transition-colors"
          >
            {isDegree ? 'DEG' : 'RAD'}
          </button>
        )}
      </div>

      {/* Display Screen */}
      <div className="bg-slate-950 rounded-[2rem] p-6 mb-6 border border-slate-800/50 flex flex-col items-end justify-center min-h-[130px] shadow-inner relative group">
        <div className="text-slate-500 text-xs font-mono overflow-x-auto whitespace-nowrap w-full text-right mb-2 opacity-80">
          {lastResult ? `${lastResult}` : '\u00A0'}
        </div>
        <div className={`text-slate-100 text-4xl sm:text-5xl font-bold font-mono tracking-tighter overflow-x-auto whitespace-nowrap w-full text-right leading-none ${display === 'Error' ? 'text-red-400' : ''}`}>
          {display}
        </div>
        
        {/* Error State Overlay */}
        {display === 'Error' && (
          <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px] rounded-[2rem] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <span className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Calculation Error</span>
            <p className="text-slate-400 text-[10px]">Use the AI Assistant for symbolic math or check syntax.</p>
          </div>
        )}
      </div>

      {/* Scientific Keypad Section */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-4 gap-2.5 mb-3 animate-in fade-in duration-300">
          {scientificButtons.map((btn, idx) => (
            <button
              key={`sci-${idx}`}
              onClick={() => btn.action ? btn.action() : append(btn.val!)}
              className={`
                bg-slate-800/40 hover:bg-slate-800 text-blue-300 border border-slate-700/30
                py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center
                ${btn.specialText ? 'font-mono text-amber-400' : ''}
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Standard Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {standardButtons.map((btn, idx) => (
          <button
            key={`std-${idx}`}
            onClick={() => btn.action ? btn.action() : append(btn.val!)}
            className={`
              ${btn.wide ? 'col-span-2' : ''}
              ${btn.type === 'clear' ? 'bg-slate-800/60 text-red-400 hover:bg-red-400/20 border border-red-900/10' : ''}
              ${btn.type === 'op' ? 'bg-slate-800/60 text-emerald-400 hover:bg-emerald-400/20 border border-emerald-900/10' : ''}
              ${btn.type === 'equal' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30 border border-blue-400/20' : ''}
              ${btn.type === 'num' ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-700/30' : ''}
              ${mode === 'scientific' ? 'py-4 text-xl' : 'py-5 text-2xl'}
              rounded-[1.3rem] font-bold transition-all active:scale-95 flex items-center justify-center
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

