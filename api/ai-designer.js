// /api/ai-designer.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Пока короткий system-промт для проверки.
// Потом сюда просто вставишь свой длинный промт.
const SYSTEM_PROMPT = `Ты AI-ассистент Madera Design. Отвечай кратко, вежливо и по делу.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid request: message is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[Madera AI] ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    // Собираем сообщения для Chat Completions
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history)
        ? history.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content ?? ""),
          }))
        : []),
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      messages,
      temperature: 0.4,
      max_tokens: 700,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Извините, сейчас не удалось получить ответ от сервиса. Попробуйте ещё раз чуть позже.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[Madera AI] AI_DESIGNER_ERROR", err);
    return res.status(500).json({
      error:
        "Извините, сервис временно недоступен. Попробуйте, пожалуйста, ещё раз чуть позже.",
    });
  }
}
