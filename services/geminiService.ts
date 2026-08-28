import { SolverResult } from '../types.ts';

export interface ExplainCalculationResponse {
  explanation: string;
  steps: string[];
}

export type SolveProblemResponse = SolverResult;

/**
 * =========================================================
 * GEMINI MATH SOLVER SERVICE
 * =========================================================
 *
 * This service does NOT contain fixed math questions.
 *
 * Any mathematical problem can be sent to the backend:
 *
 *   solveMathProblem("Solve 3x² - 7x + 2 = 0")
 *   solveMathProblem("Find derivative of x² sin(x)")
 *   solveMathProblem("Evaluate ∫(2x+3) dx")
 *   solveMathProblem("Solve 3x + 2y = 10 and x-y = 2")
 *
 * The backend /api/solve is responsible for calling Gemini.
 *
 * If the backend fails, a small deterministic fallback is used.
 * =========================================================
 */


/**
 * =========================================================
 * BASIC FALLBACK
 * =========================================================
 *
 * This is intentionally generic.
 *
 * It is NOT supposed to replace Gemini.
 * Its purpose is simply to prevent the UI from breaking
 * when the backend/API is unavailable.
 */
export function solveClientSide(problem: string): SolveProblemResponse {
  const clean = problem.trim();

  return {
    problemStatement: clean,

    method: 'Mathematical Analysis',

    steps: [
      `Problem received: ${clean}`,
      'The AI solver service was unavailable.',
      'The problem could not be fully solved by the fallback engine.'
    ],

    answer: 'Unable to calculate automatically.',

    explanation:
      'Please make sure the Gemini backend is running and try again.'
  };
}


/**
 * =========================================================
 * EXPLAIN CALCULATOR RESULT
 * =========================================================
 */
export const explainCalculation = async (
  expression: string,
  result: string
): Promise<ExplainCalculationResponse> => {

  try {

    const fetchPromise = fetch('/api/explain', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        expression,
        result,
      }),
    });


    const timeoutPromise = new Promise<never>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          15000
        )
    );


    const response = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]);


    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }


    const data =
      await response.json();


    /**
     * Make sure the response has the structure
     * expected by the UI.
     */
    return {
      explanation:
        typeof data?.explanation === 'string'
          ? data.explanation
          : `The calculation ${expression} evaluates to ${result}.`,

      steps:
        Array.isArray(data?.steps)
          ? data.steps
          : [
              `Expression: ${expression}`,
              `Result: ${result}`,
            ],
    };

  } catch (error) {

    console.warn(
      'Calculator explanation request failed:',
      error
    );


    /**
     * Safe fallback.
     */
    return {
      explanation:
        `The calculation ${expression} evaluates to ${result}.`,

      steps: [
        `Input expression: ${expression}`,
        'Applied standard mathematical evaluation rules.',
        `Final result: ${result}`,
      ],
    };
  }
};


/**
 * =========================================================
 * MAIN AI MATH SOLVER
 * =========================================================
 *
 * This is the important function.
 *
 * It accepts ANY problem instead of checking for specific
 * questions.
 */
export const solveMathProblem = async (
  problem: string,
  context?: string
): Promise<SolveProblemResponse> => {

  const cleanProblem = problem.trim();


  if (!cleanProblem) {
    throw new Error(
      'Please enter a mathematical problem.'
    );
  }


  try {

    /**
     * Send the problem to our backend.
     *
     * The backend should call Gemini.
     */
    const fetchPromise = fetch('/api/solve', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        problem: cleanProblem,
        context: context || '',
      }),
    });


    /**
     * Prevent the UI from waiting forever.
     */
    const timeoutPromise = new Promise<never>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error('AI request timeout')),
          30000
        )
    );


    const response = await Promise.race([
      fetchPromise,
      timeoutPromise,
    ]);


    if (!response.ok) {

      throw new Error(
        `AI server returned ${response.status}`
      );
    }


    const data =
      await response.json();


    /**
     * =====================================================
     * VALIDATE GEMINI RESPONSE
     * =====================================================
     */

    if (
      !data ||
      typeof data !== 'object'
    ) {
      throw new Error(
        'Invalid AI response.'
      );
    }


    /**
     * We require an actual answer.
     */
    if (
      !data.answer ||
      typeof data.answer !== 'string'
    ) {
      throw new Error(
        'AI did not return a valid answer.'
      );
    }


    /**
     * Normalize the response so the React component
     * always receives the same structure.
     */
    const result: SolverResult = {

      problemStatement:
        typeof data.problemStatement === 'string'
          ? data.problemStatement
          : cleanProblem,


      method:
        typeof data.method === 'string'
          ? data.method
          : 'Mathematical Analysis',


      /**
       * IMPORTANT:
       *
       * Gemini should return MANY steps.
       *
       * We never reduce them to one step.
       */
      steps:
        Array.isArray(data.steps)
          ? data.steps
              .filter(
                (step: unknown) =>
                  typeof step === 'string'
              )
              .map(
                (step: string) =>
                  step.trim()
              )
              .filter(
                (step: string) =>
                  step.length > 0
              )
          : [],


      answer:
        data.answer.trim(),


      explanation:
        typeof data.explanation === 'string'
          ? data.explanation
          : '',
    };


    /**
     * If Gemini returned no steps, create a useful
     * message rather than allowing the UI to look broken.
     */
    if (result.steps.length === 0) {

      result.steps = [
        'The AI returned a final answer without detailed derivation.'
      ];
    }


    return result;


  } catch (error) {

    console.warn(
      'Gemini solver request failed:',
      error
    );


    /**
     * =====================================================
     * FALLBACK
     * =====================================================
     *
     * Do not return a fake mathematical answer.
     *
     * Instead return a clear error state.
     */
    return solveClientSide(cleanProblem);
  }
};