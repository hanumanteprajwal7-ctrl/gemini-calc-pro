import { GoogleGenAI, Type } from "@google/genai";

const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

async function solveWithAI(problem: string, context?: string) {
  const ai = getAI();

  const prompt = `
You are the mathematical reasoning engine inside an application called Gemini Calc Pro.

Solve the user's mathematical problem accurately.

USER PROBLEM:
${problem}

${context ? `PREVIOUS CONTEXT:\n${context}` : ""}

STRICT OUTPUT RULES:

1. Return ONLY the requested JSON structure.
2. Do NOT write an essay.
3. Do NOT provide multiple methods unless the user explicitly asks for multiple methods.
4. Choose ONE best mathematical method.
5. Do not write introductions such as "Sure", "Below are the steps", etc.
6. Do not repeat the entire problem unnecessarily.
7. Keep each step short and mathematically meaningful.
8. Every step should show an actual calculation, transformation, substitution, or reasoning.
9. Use LaTeX notation for mathematical expressions.
10. Give the final answer separately in the "answer" field.
11. The "explanation" must be short — normally 1–2 sentences.
12. Do not put the entire solution into the explanation.
13. Never invent information that is not present in the problem.

For algebra:
- Identify variables and coefficients.
- Show the relevant formula or identity.
- Substitute values.
- Simplify step by step.
- State the final result.

For quadratic equations:
- Identify a, b, c.
- Calculate the discriminant.
- Apply the quadratic formula.
- Simplify the roots.
- State the roots.

For derivatives:
- Identify the applicable differentiation rule.
- Apply it.
- Simplify the derivative.

For integrals:
- Identify the integration rule.
- Integrate step by step.
- Apply limits when given.
- State the result.

For systems of equations:
- Choose the simplest appropriate elimination or substitution method.
- Show the transformations.
- State all variables.

Return JSON matching the supplied schema.
`;

  let lastError: unknown;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              problemStatement: {
                type: Type.STRING,
              },
              method: {
                type: Type.STRING,
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
              answer: {
                type: Type.STRING,
              },
              explanation: {
                type: Type.STRING,
              },
            },
            required: [
              "problemStatement",
              "method",
              "steps",
              "answer",
              "explanation",
            ],
          },
        },
      });

      const text = response.text?.trim();

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return JSON.parse(text);
    } catch (error) {
      lastError = error;
      console.error(`Model ${model} failed:`, error);
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  // Health check
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  }

  // Solve
  if (req.method === "POST") {
    try {
      const { problem, context } = req.body || {};

      if (!problem || typeof problem !== "string") {
        return res.status(400).json({
          error: "Please enter a mathematical problem.",
        });
      }

      const result = await solveWithAI(problem.trim(), context);

      return res.status(200).json({
        problemStatement:
          typeof result.problemStatement === "string"
            ? result.problemStatement
            : problem,

        method:
          typeof result.method === "string"
            ? result.method
            : "Mathematical Analysis",

        steps:
          Array.isArray(result.steps)
            ? result.steps.filter(
                (step: unknown) =>
                  typeof step === "string" && step.trim().length > 0
              )
            : [],

        answer:
          typeof result.answer === "string"
            ? result.answer
            : "No answer returned.",

        explanation:
          typeof result.explanation === "string"
            ? result.explanation
            : "",
      });
    } catch (error: any) {
      console.error("Solve error:", error);

      return res.status(500).json({
        error: error?.message || "AI solver failed.",
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed",
  });
}