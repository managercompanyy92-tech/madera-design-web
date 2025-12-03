// api/ai-designer.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history, systemPrompt } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "No message provided" });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    if (Array.isArray(history)) {
      for (const item of history) {
        if (
          item.role &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.text === "string"
        ) {
          messages.push({
            role: item.role,
            content: item.text,
          });
        }
      }
    }

    messages.push({
      role: "user",
      content: message,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.6,
    });

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "Не удалось получить ответ от модели.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI-DESIGNER API ERROR:", error);

    return res.status(200).json({
      reply:
        "Извините, сейчас наблюдается временная перегрузка. Попробуйте ещё раз чуть позже.",
    });
  }
}
