import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey1 = process.env.GEMINI_API_KEY;
const apiKey2 = process.env.GEMINI_API_KEY_2;

const ai1 = apiKey1
  ? new GoogleGenAI({
      apiKey: apiKey1,
    })
  : null;

const ai2 = apiKey2
  ? new GoogleGenAI({
      apiKey: apiKey2,
    })
  : null;

/**
 * Clean AI text before sending it to the frontend.
 * Removes unnecessary Markdown / LaTeX formatting.
 */
function cleanText(text: string): string {
  if (!text) return '';

  let result = text;

  // Markdown bold / italic
  result = result.replace(/\*\*(.*?)\*\*/g, '$1');
  result = result.replace(/\*(.*?)\*/g, '$1');
  result = result.replace(/__(.*?)__/g, '$1');
  result = result.replace(/_(.*?)_/g, '$1');

  // LaTeX fractions
  result = result.replace(
    /\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
    '$1/$2'
  );

  // Square roots
  result = result.replace(
    /\\sqrt\s*\{([^{}]*)\}/g,
    'sqrt($1)'
  );

  // Common mathematical LaTeX
  result = result.replace(/\\times/g, ' × ');
  result = result.replace(/\\cdot/g, ' × ');
  result = result.replace(/\\pm/g, '±');
  result = result.replace(/\\leq/g, '≤');
  result = result.replace(/\\geq/g, '≥');
  result = result.replace(/\\neq/g, '≠');
  result = result.replace(/\\infty/g, '∞');

  // LaTeX text commands
  result = result.replace(
    /\\text\s*\{([^{}]*)\}/g,
    '$1'
  );

  result = result.replace(
    /\\mathrm\s*\{([^{}]*)\}/g,
    '$1'
  );

  result = result.replace(
    /\\mathbf\s*\{([^{}]*)\}/g,
    '$1'
  );

  // Remove math delimiters
  result = result.replace(/\$\$/g, '');
  result = result.replace(/\$/g, '');

  // Remove remaining LaTeX commands
  result = result.replace(/\\([a-zA-Z]+)/g, '$1');

  // Remove unnecessary braces
  result = result.replace(/[{}]/g, '');

  // Markdown headings
  result = result.replace(/^#{1,6}\s*/gm, '');

  // Markdown bullets
  result = result.replace(/^\s*[-*]\s+/gm, '');

  // Excessive whitespace
  result = result.replace(/[ \t]+/g, ' ');
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Extract JSON from Gemini response safely.
 */
function parseAIResponse(text: string) {
  let cleaned = text.trim();

  // Remove markdown code fences
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to locate the JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(
          cleaned.substring(start, end + 1)
        );
      } catch {
        return null;
      }
    }

    return null;
  }
}

/**
 * Main Vercel API handler.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    /**
     * HEALTH CHECK
     */
    if (
      req.method === 'GET' &&
      req.url?.split('?')[0] === '/api/health'
    ) {
      return res.status(200).json({
        status: 'ok',
        aiConfigured: !!(apiKey1 || apiKey2),
      });
    }

    /**
     * SOLVE API
     */
    if (
      req.method === 'POST' &&
      req.url?.split('?')[0] === '/api/solve'
    ) {
      if (!ai1 && !ai2) {
  return res.status(500).json({
    error: 'Gemini API keys are not configured.',
  });
}

      const { problem, context } = req.body || {};

      if (
        typeof problem !== 'string' ||
        !problem.trim()
      ) {
        return res.status(400).json({
          error: 'Mathematical problem is required.',
        });
      }

      const cleanProblem = problem.trim();

      /**
       * Strong instructions for clean calculator output.
       */
      const prompt = `
You are the AI Math Assistant inside a professional calculator application.

Solve the user's mathematical problem accurately.

USER PROBLEM:
${cleanProblem}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

IMPORTANT OUTPUT RULES:

Return ONLY valid JSON.

Do NOT use Markdown.

Do NOT use LaTeX.

Do NOT use dollar signs.

Do NOT use \\frac, \\sqrt, $$, or other LaTeX commands.

Do NOT put the answer inside a long paragraph.

Use simple, clean mathematical notation that looks natural inside a calculator application.

For example:

BAD:
x = \\frac{1}{2}, -3

GOOD:
x = 1/2 and x = -3

BAD:
\\sqrt{49} = 7

GOOD:
sqrt(49) = 7

BAD:
$$2x^2 + 5x - 3 = 0$$

GOOD:
2x² + 5x - 3 = 0

The final answer must be SHORT and CLEAR.

The steps should be concise and easy for a student to understand.

Do not give multiple methods unless they are genuinely useful.

For a quadratic equation, prefer one clear method such as factoring or the quadratic formula.

The explanation should explain WHY the method works, not repeat the entire solution.

Return exactly this JSON structure:

{
  "problemStatement": "clean version of the problem",
  "method": "name of the method used",
  "steps": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "answer": "short final answer",
  "explanation": "short, clear explanation of why the answer is correct"
}

Make sure the JSON is valid.

Do not add anything before or after the JSON.
`;

      let response;

try {
  if (ai1) {
    response = await ai1.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
  } else if (ai2) {
    response = await ai2.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
  }
} catch (error: any) {
  const status = error?.status || error?.error?.code;

  // If the first Gemini project has reached its quota,
  // automatically try the second Gemini project.
  if (status === 429 && ai2) {
    console.warn(
      'Primary Gemini API quota exceeded. Trying secondary API key...'
    );

    try {
      response = await ai2.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });
    } catch (secondaryError) {
      console.error(
        'Secondary Gemini API also failed:',
        secondaryError
      );

      throw secondaryError;
    }
  } else {
    throw error;
  }
}

if (!response) {
  return res.status(500).json({
    error: 'Gemini API did not return a response.',
  });
}

      const rawText =
        typeof response.text === 'string'
          ? response.text
          : '';

      if (!rawText) {
        return res.status(500).json({
          error: 'Gemini returned an empty response.',
        });
      }

      const parsed = parseAIResponse(rawText);

      if (!parsed) {
        console.error(
          'Could not parse Gemini response:',
          rawText
        );

        return res.status(500).json({
          error: 'Invalid response from Gemini.',
        });
      }

      /**
       * Normalize everything before sending it
       * to React.
       */
      const result = {
        problemStatement:
          typeof parsed.problemStatement === 'string'
            ? cleanText(parsed.problemStatement)
            : cleanProblem,

        method:
          typeof parsed.method === 'string'
            ? cleanText(parsed.method)
            : 'Mathematical Analysis',

        steps:
          Array.isArray(parsed.steps)
            ? parsed.steps
                .filter(
                  (step: unknown) =>
                    typeof step === 'string'
                )
                .map((step: string) =>
                  cleanText(step)
                )
                .filter(
                  (step: string) =>
                    step.length > 0
                )
            : [],

        answer:
          typeof parsed.answer === 'string'
            ? cleanText(parsed.answer)
            : 'No answer returned.',

        explanation:
          typeof parsed.explanation === 'string'
            ? cleanText(parsed.explanation)
            : '',
      };

      return res.status(200).json(result);
    }

    /**
     * Unknown API route
     */
    return res.status(404).json({
      error: 'API route not found',
    });
  } catch (error) {
    console.error('Solve error:', error);

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Internal server error',
    });
  }
}