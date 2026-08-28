import React, { useEffect, useState } from 'react';
import {
  explainCalculation,
  solveMathProblem,
  solveClientSide,
} from '../services/geminiService.ts';

import {
  CalculationHistory,
  AiExplanation,
  SolverHistoryItem,
  SolverResult,
} from '../types.ts';

interface AiAssistantProps {
  currentDisplay: string;
  history: CalculationHistory[];
  solverHistory: SolverHistoryItem[];
  onUpdateSolverHistory: (history: SolverHistoryItem[]) => void;
  initialPrompt?: string;
}

/**
 * Convert common AI mathematical formatting into clean readable text.
 */
const cleanMathText = (text: string): string => {
  if (!text) return '';

  let cleaned = text;

  // Markdown emphasis
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');

  // LaTeX fractions
  cleaned = cleaned.replace(
    /\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
    '$1/$2'
  );

  // Square roots
  cleaned = cleaned.replace(
    /\\sqrt\s*\{([^{}]*)\}/g,
    'sqrt($1)'
  );

  // Common LaTeX symbols
  cleaned = cleaned.replace(/\\times/g, ' × ');
  cleaned = cleaned.replace(/\\cdot/g, ' × ');
  cleaned = cleaned.replace(/\\pm/g, ' ± ');
  cleaned = cleaned.replace(/\\leq/g, ' ≤ ');
  cleaned = cleaned.replace(/\\geq/g, ' ≥ ');
  cleaned = cleaned.replace(/\\neq/g, ' ≠ ');
  cleaned = cleaned.replace(/\\infty/g, '∞ ');

  // Remove math delimiters
  cleaned = cleaned.replace(/\$\$/g, '');
  cleaned = cleaned.replace(/\$/g, '');

  // Text commands
  cleaned = cleaned.replace(
    /\\text\s*\{([^{}]*)\}/g,
    '$1'
  );

  cleaned = cleaned.replace(
    /\\mathrm\s*\{([^{}]*)\}/g,
    '$1'
  );

  cleaned = cleaned.replace(
    /\\mathbf\s*\{([^{}]*)\}/g,
    '$1'
  );

  // Remove simple remaining LaTeX commands
  cleaned = cleaned.replace(
    /\\([a-zA-Z]+)/g,
    '$1'
  );

  // Remove unnecessary braces
  cleaned = cleaned.replace(/[{}]/g, '');

  // Remove Markdown headings
  cleaned = cleaned.replace(/^#+\s*/gm, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
};

/**
 * Clean a step returned by the AI.
 *
 * This removes accidental numbering such as:
 * "1"
 * "2."
 * "Step 3:"
 *
 * because the UI already provides the step number.
 */
const cleanStep = (step: string): string => {
  if (!step) return '';

  let cleaned = cleanMathText(step);

  cleaned = cleaned.replace(
    /^step\s*\d+\s*[:.)-]?\s*/i,
    ''
  );

  cleaned = cleaned.replace(
    /^\d+\s*[:.)-]\s*/,
    ''
  );

  cleaned = cleaned.replace(
    /^\d+\s*$/,
    ''
  );

  return cleaned.trim();
};

/**
 * Ensure the solver always has usable steps.
 */
const normalizeSteps = (
  steps: unknown,
  problem: string
): string[] => {
  if (!Array.isArray(steps)) {
    return [
      `Identify the given mathematical problem: ${problem}`,
      'Apply the appropriate mathematical method or formula.',
      'Simplify the resulting expression.',
      'Verify the result.',
    ];
  }

  const cleaned = steps
    .map((step) =>
      typeof step === 'string'
        ? cleanStep(step)
        : ''
    )
    .filter(Boolean);

  return cleaned.length > 0
    ? cleaned
    : [
        `Identify the given mathematical problem: ${problem}`,
        'Apply the appropriate mathematical method or formula.',
        'Simplify the resulting expression.',
        'Verify the result.',
      ];
};

export const AiAssistant: React.FC<AiAssistantProps> = ({
  currentDisplay,
  history,
  solverHistory,
  onUpdateSolverHistory,
  initialPrompt,
}) => {
  const [loading, setLoading] =
    useState(false);

  const [loadingStep, setLoadingStep] =
    useState('Analyzing problem...');

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [explanation, setExplanation] =
    useState<AiExplanation | null>(null);

  const [problemInput, setProblemInput] =
    useState('');

  const [followUpInput, setFollowUpInput] =
    useState('');

  const [solution, setSolution] =
    useState<SolverResult | null>(null);

  const [activeTab, setActiveTab] =
    useState<'solve' | 'explain' | 'history'>(
      'solve'
    );

  const [copied, setCopied] =
    useState(false);

  const [filterStarred, setFilterStarred] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * RESTORE LAST SOLUTION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      !solution &&
      solverHistory.length > 0
    ) {
      const latest = solverHistory[0];

      setProblemInput(latest.problem);

      setSolution({
        problemStatement:
          latest.problemStatement ||
          latest.problem,

        method:
          latest.method ||
          'Mathematical Analysis',

        steps: normalizeSteps(
          latest.steps,
          latest.problem
        ),

        answer:
          latest.answer ||
          'No answer returned.',

        explanation:
          latest.explanation || '',
      });

      setActiveTab('solve');
    }
  }, [solverHistory, solution]);

  /*
   * ---------------------------------------------------------
   * INITIAL PROMPT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      initialPrompt &&
      initialPrompt.trim()
    ) {
      const prompt =
        initialPrompt.trim();

      setProblemInput(prompt);
      setActiveTab('solve');

      handleSolve(prompt);
    }
  }, [initialPrompt]);

  /*
   * ---------------------------------------------------------
   * LOADING STATUS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let timer:
      | ReturnType<typeof setTimeout>
      | undefined;

    if (loading) {
      setLoadingStep(
        'Analyzing mathematical notation...'
      );

      timer = setTimeout(() => {
        setLoadingStep(
          'Applying formulas & analytical proofs...'
        );
      }, 1500);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [loading]);

  /*
   * ---------------------------------------------------------
   * QUICK PROMPTS
   * ---------------------------------------------------------
   */

  const quickPrompts = [
    {
      label: 'Quadratic',
      text: 'Solve 2x^2 + 5x - 3 = 0',
    },
    {
      label: 'Derivative',
      text: 'Find derivative of f(x) = x^3 * sin(x)',
    },
    {
      label: 'Integral',
      text: 'Evaluate integral of (3x^2 + 2x) dx from 0 to 2',
    },
    {
      label: 'Limit',
      text: 'Find limit as x approaches 0 of (sin(x)/x)',
    },
    {
      label: 'Linear System',
      text: 'Solve system: 2x + 3y = 12 and x - y = 1',
    },
    {
      label: 'Probability',
      text: 'What is probability of rolling a sum of 8 with two fair dice?',
    },
  ];

  /*
   * ---------------------------------------------------------
   * EXPLAIN CALCULATOR RESULT
   * ---------------------------------------------------------
   */

  const handleExplain = async () => {
    if (history.length === 0) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setExplanation(null);

    try {
      const last = history[0];

      const result =
        await explainCalculation(
          last.expression,
          last.result
        );

      setExplanation(result);
    } catch (_err) {
      const last = history[0];

      setExplanation({
        explanation: `The calculation ${last.expression} evaluates to ${last.result}.`,

        steps: [
          `Parsed expression: ${last.expression}`,
          'Applied standard mathematical rules and operator precedence.',
          `Result: ${last.result}`,
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SAVE SOLUTION TO HISTORY
   * ---------------------------------------------------------
   */

  const saveSolutionToHistory = (
    problem: string,
    result: SolverResult
  ) => {
    const newItem: SolverHistoryItem = {
      id: Math.random()
        .toString(36)
        .substring(2, 11),

      problem,

      problemStatement:
        result.problemStatement,

      method:
        result.method,

      steps:
        result.steps,

      answer:
        result.answer,

      explanation:
        result.explanation,

      timestamp: Date.now(),

      isStarred: false,
    };

    onUpdateSolverHistory([
      newItem,
      ...solverHistory,
    ].slice(0, 50));
  };

  /*
   * ---------------------------------------------------------
   * SOLVE PROBLEM
   * ---------------------------------------------------------
   */

  const handleSolve = async (
    overridePrompt?: string,
    contextStr?: string
  ) => {
    const textToSolve = (
      overridePrompt !== undefined
        ? overridePrompt
        : problemInput
    ).trim();

    if (!textToSolve) {
      return;
    }

    setProblemInput(textToSolve);
    setLoading(true);
    setErrorMessage(null);
    setCopied(false);
    setExplanation(null);

    try {
      /*
       * Primary AI solver
       */
      const result =
        await solveMathProblem(
          textToSolve,
          contextStr
        );

      const safeResult: SolverResult = {
        problemStatement:
          result?.problemStatement ||
          textToSolve,

        method:
          result?.method ||
          'Mathematical Analysis',

        steps: normalizeSteps(
          result?.steps,
          textToSolve
        ),

        answer:
          result?.answer ||
          'No answer returned.',

        explanation:
          result?.explanation || '',
      };

      /*
       * DISPLAY RESULT IMMEDIATELY
       */
      setSolution(safeResult);
      setActiveTab('solve');

      /*
       * SAVE RESULT
       */
      saveSolutionToHistory(
        textToSolve,
        safeResult
      );

      setFollowUpInput('');
    } catch (err) {
      /*
       * AI failed.
       * Try local mathematical engine.
       */

      console.warn(
        'AI solver failed. Using client-side solver.',
        err
      );

      try {
        const fallbackResult =
          solveClientSide(textToSolve);

        const safeFallback: SolverResult = {
          problemStatement:
            fallbackResult?.problemStatement ||
            textToSolve,

          method:
            fallbackResult?.method ||
            'Client-Side Mathematical Solver',

          steps: normalizeSteps(
            fallbackResult?.steps,
            textToSolve
          ),

          answer:
            fallbackResult?.answer ||
            'No answer available.',

          explanation:
            fallbackResult?.explanation ||
            '',
        };

        /*
         * DISPLAY FALLBACK RESULT
         */
        setSolution(safeFallback);
        setActiveTab('solve');

        /*
         * SAVE FALLBACK RESULT
         */
        saveSolutionToHistory(
          textToSolve,
          safeFallback
        );

        setFollowUpInput('');
      } catch (fallbackError) {
        console.error(
          'Client-side solver also failed:',
          fallbackError
        );

        setErrorMessage(
          'Unable to solve this problem.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CANCEL
   * ---------------------------------------------------------
   */

  const handleCancelLoading = () => {
    setLoading(false);
    setErrorMessage(
      'Operation was cancelled.'
    );
  };

  /*
   * ---------------------------------------------------------
   * FOLLOW-UP QUESTION
   * ---------------------------------------------------------
   */

  const handleFollowUp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !followUpInput.trim() ||
      !solution ||
      loading
    ) {
      return;
    }

    const question =
      followUpInput.trim();

    const context = `
You are explaining a mathematical solution.

Original Problem:
${problemInput}

Method Used:
${solution.method}

Final Answer:
${solution.answer}

Step-by-step solution:
${solution.steps.join('\n')}

Explanation:
${solution.explanation}

User's question:
${question}

Answer specifically about this solution.

Do not solve a different problem.

Explain clearly and simply.
`;

    setLoading(true);
    setErrorMessage(null);

    try {
      const answer =
        await solveMathProblem(
          question,
          context
        );

      setSolution((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,

          explanation:
            answer?.explanation ||
            previous.explanation,

          steps:
            answer?.steps &&
            answer.steps.length > 0
              ? normalizeSteps(
                  answer.steps,
                  problemInput
                )
              : previous.steps,
        };
      });

      setFollowUpInput('');
    } catch (_err) {
      setErrorMessage(
        'Unable to answer the follow-up question.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * STAR
   * ---------------------------------------------------------
   */

  const toggleStar = (
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    onUpdateSolverHistory(
      solverHistory.map((item) =>
        item.id === id
          ? {
              ...item,
              isStarred:
                !item.isStarred,
            }
          : item
      )
    );
  };

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  const deleteItem = (
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    onUpdateSolverHistory(
      solverHistory.filter(
        (item) => item.id !== id
      )
    );
  };

  /*
   * ---------------------------------------------------------
   * LOAD HISTORY
   * ---------------------------------------------------------
   */

  const loadHistoryItem = (
    item: SolverHistoryItem
  ) => {
    setProblemInput(item.problem);

    setSolution({
      problemStatement:
        item.problemStatement ||
        item.problem,

      method:
        item.method ||
        'Standard Method',

      steps: normalizeSteps(
        item.steps,
        item.problem
      ),

      answer:
        item.answer ||
        'No answer available.',

      explanation:
        item.explanation || '',
    });

    setExplanation(null);
    setActiveTab('solve');
  };

  /*
   * ---------------------------------------------------------
   * COPY
   * ---------------------------------------------------------
   */

  const copyToClipboard = async (
    text: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (_err) {
      setErrorMessage(
        'Unable to copy answer.'
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * FILTER HISTORY
   * ---------------------------------------------------------
   */

  const displayedHistory =
    filterStarred
      ? solverHistory.filter(
          (item) => item.isStarred
        )
      : solverHistory;

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl h-full flex flex-col min-h-[620px] transition-all">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <i className="fas fa-brain text-white text-xl"></i>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Math Assistant Engine
            </h2>

            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">
              Step-by-Step Solver & Reasoning
            </p>
          </div>

        </div>
      </div>

      {/* TABS */}

      <div className="flex bg-slate-950/60 p-1 rounded-2xl mb-6 border border-slate-800/50">

        <button
          onClick={() =>
            setActiveTab('solve')
          }
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'solve'
              ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <i className="fas fa-square-root-alt mr-1.5"></i>
          Math Solver
        </button>

        <button
          onClick={() =>
            setActiveTab('explain')
          }
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'explain'
              ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <i className="fas fa-lightbulb mr-1.5"></i>
          Calc Logic
        </button>

        <button
          onClick={() =>
            setActiveTab('history')
          }
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'history'
              ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700/50'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <i className="fas fa-history mr-1.5"></i>
          History ({displayedHistory.length})
        </button>

      </div>

      {/* CONTENT */}

      <div className="flex-1 flex flex-col overflow-y-auto pr-1 custom-scrollbar">

        {/* =================================================
            SOLVER TAB
        ================================================= */}

        {activeTab === 'solve' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">

            {/* INPUT */}

            <div className="flex flex-col gap-3">

              <div className="flex items-center justify-between">

                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Describe or paste math problem:
                </label>

                {problemInput && (
                  <button
                    onClick={() =>
                      setProblemInput('')
                    }
                    className="text-[11px] text-slate-500 hover:text-slate-300 font-medium"
                  >
                    Clear Input
                  </button>
                )}

              </div>

              <textarea
                value={problemInput}
                onChange={(e) =>
                  setProblemInput(
                    e.target.value
                  )
                }
                placeholder="E.g. Solve 2x^2 + 5x - 3 = 0"
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 text-sm md:text-base text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-28 shadow-inner transition-all placeholder:text-slate-600 font-sans"
              />

              {/* QUICK PROMPTS */}

              <div className="flex items-center gap-1.5 flex-wrap">

                <span className="text-[10px] uppercase font-bold text-slate-600 mr-1">
                  Quick:
                </span>

                {quickPrompts.map(
                  (prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setProblemInput(
                          prompt.text
                        );

                        handleSolve(
                          prompt.text
                        );
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-slate-700 transition-all font-mono"
                    >
                      {prompt.label}
                    </button>
                  )
                )}

              </div>

              {/* SOLVE BUTTON */}

              <button
                onClick={() =>
                  handleSolve()
                }
                disabled={
                  loading ||
                  !problemInput.trim()
                }
                className="bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 mt-1"
              >

                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>

                    <span>
                      Solving step-by-step...
                    </span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>

                    <span>
                      Solve Step-by-Step
                    </span>
                  </>
                )}

              </button>

            </div>

            {/* ERROR */}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <i className="fas fa-exclamation-circle"></i>

                  <span>
                    {errorMessage}
                  </span>

                </div>

                <button
                  onClick={() =>
                    handleSolve()
                  }
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Retry
                </button>

              </div>
            )}

            {/* LOADING */}

            {loading && (
              <div className="py-10 px-6 rounded-3xl bg-slate-950/70 border border-blue-500/30 flex flex-col items-center justify-center gap-4">

                <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>

                <div className="text-center">

                  <p className="text-sm font-bold text-white mb-1">
                    {loadingStep}
                  </p>

                  <p className="text-xs text-slate-500">
                    Deriving full mathematical steps with reasoning
                  </p>

                </div>

                <button
                  onClick={
                    handleCancelLoading
                  }
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>

              </div>
            )}

            {/* =================================================
                LIVE SOLUTION
            ================================================= */}

            {solution && !loading && (
              <div className="space-y-5 animate-in slide-in-from-bottom-3 duration-400">

                {/* FINAL ANSWER */}

                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">

                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center gap-2">

                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>

                      <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        Final Answer
                      </h4>

                    </div>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          solution.answer
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        copied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >

                      <i
                        className={`fas ${
                          copied
                            ? 'fa-check'
                            : 'fa-copy'
                        }`}
                      ></i>

                      {copied
                        ? 'Copied'
                        : 'Copy'}

                    </button>

                  </div>

                  <div className="text-white text-2xl md:text-3xl font-mono font-bold tracking-tight break-words py-1">
                    {cleanMathText(
                      solution.answer
                    )}
                  </div>

                </div>

                {/* PROBLEM */}

                <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80">

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Problem
                  </span>

                  <p className="text-sm text-slate-200 font-mono mt-1 whitespace-pre-wrap">
                    {problemInput}
                  </p>

                </div>

                {/* METHOD */}

                {solution.method && (
                  <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 flex items-center gap-3">

                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <i className="fas fa-compass"></i>
                    </div>

                    <div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Method / Formula
                      </span>

                      <p className="text-sm font-semibold text-slate-200">
                        {solution.method}
                      </p>

                    </div>

                  </div>
                )}

                {/* STEPS */}

                {solution.steps &&
                  solution.steps.length > 0 && (
                    <div className="space-y-3">

                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2">
                        <i className="fas fa-list-ol text-blue-400"></i>
                        Step-by-Step Derivation
                      </h4>

                      <div className="space-y-2.5">

                        {solution.steps.map(
                          (step, index) => (
                            <div
                              key={index}
                              className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 flex items-start gap-3.5"
                            >

                              <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                                {index + 1}
                              </span>

                              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono flex-1">
                                {cleanStep(step)}
                              </p>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                {/* EXPLANATION */}

                {solution.explanation && (
                  <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800/60">

                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">

                      <i className="fas fa-info-circle text-indigo-400"></i>

                      Insight & Verification

                    </h4>

                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {cleanMathText(
                        solution.explanation
                      )}
                    </p>

                  </div>
                )}

                {/* FOLLOW-UP */}

                <form
                  onSubmit={
                    handleFollowUp
                  }
                  className="mt-4 pt-4 border-t border-slate-800 flex gap-2"
                >

                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) =>
                      setFollowUpInput(
                        e.target.value
                      )
                    }
                    placeholder="Ask a follow-up..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !followUpInput.trim()
                    }
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl text-xs font-bold border border-slate-700 disabled:opacity-50"
                  >
                    Ask
                  </button>

                </form>

              </div>
            )}

            {/* DEFAULT STATE */}

            {!solution && !loading && (
              <div className="space-y-4 pt-2">

                {history.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between gap-3">

                    <div className="truncate">

                      <span className="text-[10px] uppercase font-bold text-blue-400 block">
                        Recent Calculator Expression:
                      </span>

                      <p className="text-xs font-mono font-bold text-white truncate">
                        {history[0].expression}
                        {' = '}
                        {history[0].result}
                      </p>

                    </div>

                    <button
                      onClick={() => {
                        const question =
                          `Explain calculation: ${history[0].expression} = ${history[0].result}`;

                        setProblemInput(
                          question
                        );

                        handleSolve(
                          question
                        );
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      Solve in AI
                    </button>

                  </div>
                )}

                <div className="bg-slate-950/40 rounded-2xl p-5 border border-slate-800/60">

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">

                    <i className="fas fa-sparkles text-amber-400"></i>

                    Supported Mathematical Domains

                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">

                    <button
                      onClick={() => {
                        const p =
                          'Solve 2x^2 + 5x - 3 = 0';

                        setProblemInput(p);
                        handleSolve(p);
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-slate-200">
                        Algebra & Equations
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Quadratic, polynomials, roots
                      </p>

                    </button>

                    <button
                      onClick={() => {
                        const p =
                          'Find derivative of f(x) = x^3 * sin(x)';

                        setProblemInput(p);
                        handleSolve(p);
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-slate-200">
                        Calculus & Limits
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Derivatives, integrals, limits
                      </p>

                    </button>

                    <button
                      onClick={() => {
                        const p =
                          'Solve system: 2x + 3y = 12 and x - y = 1';

                        setProblemInput(p);
                        handleSolve(p);
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-slate-200">
                        Linear Systems
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Simultaneous linear equations
                      </p>

                    </button>

                    <button
                      onClick={() => {
                        const p =
                          'What is probability of rolling a sum of 8 with two fair dice?';

                        setProblemInput(p);
                        handleSolve(p);
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-slate-200">
                        Probability & Stats
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Combinatorics, distributions
                      </p>

                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* =================================================
            CALC LOGIC TAB
        ================================================= */}

        {activeTab === 'explain' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">

            {solution ? (
              <>
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5">

                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Current Problem
                  </span>

                  <p className="text-slate-200 text-sm md:text-base mt-2 font-mono whitespace-pre-wrap">
                    {problemInput}
                  </p>

                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">

                  <div className="flex items-center gap-2 mb-2">

                    <i className="fas fa-compass text-blue-400"></i>

                    <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                      Method / Formula Used
                    </h4>

                  </div>

                  <p className="text-white text-sm font-semibold">
                    {solution.method}
                  </p>

                </div>

                <div className="space-y-3">

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">

                    <i className="fas fa-list-ol text-blue-400"></i>

                    Step-by-Step Logic

                  </h4>

                  {solution.steps?.map(
                    (step, index) => (
                      <div
                        key={index}
                        className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70 flex items-start gap-3"
                      >

                        <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </span>

                        <p className="text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap flex-1">
                          {cleanStep(step)}
                        </p>

                      </div>
                    )
                  )}

                </div>

                {solution.explanation && (
                  <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800/60">

                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">

                      <i className="fas fa-lightbulb text-amber-400"></i>

                      Explanation

                    </h4>

                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {cleanMathText(
                        solution.explanation
                      )}
                    </p>

                  </div>
                )}

                <div className="border-t border-slate-800 pt-5">

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Ask About This Solution
                  </h4>

                  <form
                    onSubmit={
                      handleFollowUp
                    }
                    className="flex gap-2"
                  >

                    <input
                      type="text"
                      value={followUpInput}
                      onChange={(e) =>
                        setFollowUpInput(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Explain step 2..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !followUpInput.trim()
                      }
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                    >

                      <i className="fas fa-paper-plane mr-1.5"></i>

                      Ask

                    </button>

                  </form>

                </div>
              </>
            ) : (
              <div className="bg-slate-950/50 rounded-2xl p-10 border border-dashed border-slate-800 text-center">

                <i className="fas fa-lightbulb text-3xl text-slate-700 mb-3"></i>

                <p className="text-slate-500 text-sm">
                  Solve a problem first to see its calculation logic here.
                </p>

                <button
                  onClick={() =>
                    setActiveTab('solve')
                  }
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-blue-400"
                >
                  Go to Math Solver
                </button>

              </div>
            )}

          </div>
        )}

        {/* =================================================
            HISTORY TAB
        ================================================= */}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">

            <div className="flex justify-between items-center px-1 mb-1">

              <button
                onClick={() =>
                  setFilterStarred(
                    !filterStarred
                  )
                }
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  filterStarred
                    ? 'text-amber-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >

                <i className="fas fa-star"></i>

                {filterStarred
                  ? 'Showing Starred Only'
                  : 'Filter Starred'}

              </button>

              <span className="text-[11px] text-slate-500 uppercase font-mono">
                {displayedHistory.length}{' '}
                saved
              </span>

            </div>

            {displayedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-3">

                <i className="fas fa-history text-4xl opacity-25"></i>

                <p className="text-center text-xs font-medium">
                  No{' '}
                  {filterStarred
                    ? 'starred'
                    : ''}{' '}
                  solver items yet
                </p>

              </div>
            ) : (
              displayedHistory.map(
                (item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      loadHistoryItem(
                        item
                      )
                    }
                    className={`w-full text-left p-5 rounded-2xl bg-slate-950/80 border transition-all group relative cursor-pointer ${
                      item.isStarred
                        ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'border-slate-800 hover:border-blue-500/40'
                    }`}
                  >

                    <div className="flex justify-between items-start mb-2">

                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(
                          item.timestamp
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>

                      <div className="flex gap-3">

                        <button
                          onClick={(e) =>
                            toggleStar(
                              item.id,
                              e
                            )
                          }
                          className={`transition-all hover:scale-125 text-sm ${
                            item.isStarred
                              ? 'text-amber-400'
                              : 'text-slate-700 hover:text-amber-400'
                          }`}
                        >

                          <i
                            className={`fa-star ${
                              item.isStarred
                                ? 'fas'
                                : 'far'
                            }`}
                          ></i>

                        </button>

                        <button
                          onClick={(e) =>
                            deleteItem(
                              item.id,
                              e
                            )
                          }
                          className="text-slate-700 hover:text-red-400 transition-all hover:scale-125 text-sm"
                        >

                          <i className="fas fa-trash-alt"></i>

                        </button>

                      </div>

                    </div>

                    <div className="text-xs text-slate-400 mb-1 font-medium truncate">
                      Q: {item.problem}
                    </div>

                    <div className="text-base font-mono font-bold text-white truncate">
                      A: {item.answer}
                    </div>

                  </div>
                )
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
};