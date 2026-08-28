import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method === "GET" && req.url === "/api/health") {
    return res.status(200).json({
      status: "ok",
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  }

  if (req.method === "POST" && req.url === "/api/solve") {
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
        model: "gemini-2.5-flash",
        contents: `Solve this mathematics problem step by step and give the final answer clearly:

${problem}`,
      });

      return res.status(200).json({
        problemStatement: problem,
        method: "AI Mathematical Analysis",
        steps: [response.text || "No explanation returned."],
        answer: response.text || "No answer returned.",
        explanation: response.text || "",
      });
    } catch (error: any) {
      console.error("Solve error:", error);

      return res.status(500).json({
        error: error?.message || "AI solver failed.",
      });
    }
  }

  return res.status(404).json({
    error: "API route not found",
  });
}