// src/pages/api/analyze.ts
import type { APIRoute } from "astro";

const SYSTEM_PROMPT = `You are a practical pediatric sleep coach. You analyse structured sleep metrics and provide short, actionable, supportive guidance. DO NOT provide medical advice. Do NOT diagnose conditions. Keep responses under 200 words. Return ONLY valid JSON in this exact structure:
{
"overall_summary":"",
"twinA_insight":"",
"twinB_insight":"",
"overlap_advice":"",
"actionable_steps":[]
}
`;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Get the metrics sent from your Vue component
    const { metrics } = await request.json();

    if (!metrics) {
      return new Response(JSON.stringify({ error: "No metrics provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Call the DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat", // or 'deepseek-flash' for cheaper/faster [citation:3]
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Here are the sleep metrics for the past week:\n${JSON.stringify(metrics)}` },
        ],
        // Enable JSON output mode to ensure a parseable response [citation:3]
        response_format: { type: "json_object" },
        max_tokens: 500, // Prevent runaway responses [citation:3]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "DeepSeek API request failed");
    }

    const data = await response.json();

    // 4. Return the content back to the frontend
    // The frontend will parse the JSON string inside .content
    return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
