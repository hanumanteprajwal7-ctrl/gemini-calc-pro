import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Health check
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  }

  // AI Solver
  if (req.method === "POST") {
    try {
      const { problem } = req.body || {};

      if (!problem) {
        return res.status(400).json({
          error: "Please enter a mathematical problem.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in Vercel.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Solve this mathematics problem step by step and give the final answer clearly:

${problem}`,
      });

      const answer = response.text || "No answer returned.";

      return res.status(200).json({
        problemStatement: problem,
        method: "AI Mathematical Analysis",
        steps: [answer],
        answer,
        explanation: answer,
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