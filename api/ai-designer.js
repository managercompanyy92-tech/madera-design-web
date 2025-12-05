// /api/ai-designer.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ВСТАВЬТЕ СЮДА ВЕСЬ ВАШ БОЛЬШОЙ SYSTEM-ПРОМТ
const SYSTEM_PROMPT = `Ты AI-ассистент. Отвечай кратко и вежливо.`;

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
    // Собираем историю в один текстовый блок
    const historyText = Array.isArray(history)
      ? history
          .map((m) => {
            const role = m.role === "assistant" ? "AI" : "Клиент";
            return `${role}: ${String(m.content ?? "")}`;
          })
          .join("\n")
      : "";

    // Единая текстовая подсказка для Responses API
    const fullPrompt = `
СИСТЕМА (инструкции):
${SYSTEM_PROMPT}

ИСТОРИЯ ДИАЛОГА:
${historyText}

НОВЫЙ ВОПРОС КЛИЕНТА:
Клиент: ${message}

Ответь как AI-дизайнер и AI-менеджер Madera Design:
`;

    const response = await client.responses.create({
      model: "gpt-5.1",
      input: fullPrompt,
      temperature: 0.4,
      max_output_tokens: 700,
    });

    // Аккуратно достаём текст ответа
    let reply =
      "Извините, сейчас не удалось получить ответ от сервиса. Попробуйте ещё раз чуть позже.";

    try {
      const firstOutput = response.output?.[0];
      const firstContent = firstOutput?.content?.[0];

      if (firstContent?.type === "output_text") {
        reply = firstContent.output_text?.text?.trim() || reply;
      }
    } catch (parseErr) {
      console.error("[Madera AI] PARSE_OPENAI_RESPONSE_ERROR", parseErr);
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[Madera AI] AI_DESIGNER_ERROR", err);
    return res.status(500).json({
      error:
        "Извините, сервис временно недоступен. Попробуйте, пожалуйста, ещё раз чуть позже.",
    });
  }
}
