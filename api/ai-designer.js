// /api/ai-designer.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ваш длинный промт сюда
const SYSTEM_PROMPT = `
Ты AI-дизайнер и AI-менеджер компании Madera Design...
(сюда вставьте весь тот текст, который мы уже отрабатывали)
`;

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[Madera AI] ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    // собираем историю диалога
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

    // GPT-5.1 через Responses API
    const response = await client.responses.create({
      model: "gpt-5.1",
      input: messages.map((m) => ({
        role: m.role,
        content: [
          {
            type: "text",
            text: m.content,
          },
        ],
      })),
      temperature: 0.4,
      max_output_tokens: 700,
    });

    let reply =
      "Извините, сейчас не удалось получить ответ от сервиса. Попробуйте ещё раз чуть позже.";

    try {
      const firstOutput = response.output?.[0];
      const firstContent = firstOutput?.content?.[0];

      if (firstContent?.type === "output_text" && firstContent.text) {
        reply = firstContent.text;
      }
    } catch (parseErr) {
      console.error("[Madera AI] PARSE_OPENAI_RESPONSE_ERROR", parseErr);
    }

    // ВАЖНО: ключ именно reply
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[Madera AI] AI_DESIGNER_ERROR", err);
    return res.status(500).json({
      error:
        "Извините, сервис временно недоступен. Попробуйте, пожалуйста, ещё раз чуть позже.",
    });
  }
}
