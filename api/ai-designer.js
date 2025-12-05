// /api/ai-designer.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FALLBACK_REPLY =
  "Извините, сейчас не удалось получить ответ от сервиса. Попробуйте ещё раз чуть позже.";

const DEFAULT_SYSTEM_PROMPT =
  "Ты AI-ассистент по дизайну мебели. Отвечай кратко и вежливо.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history, systemPrompt } = req.body || {};

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
    // Собираем историю в один текстовый блок
    const historyText = Array.isArray(history)
      ? history
          .map((m) => {
            const role = m.role === "assistant" ? "AI" : "Клиент";
            const text = String(m.text ?? m.content ?? "");
            return `${role}: ${text}`;
          })
          .join("\n")
      : "";

    const system =
      typeof systemPrompt === "string" && systemPrompt.trim()
        ? systemPrompt.trim()
        : DEFAULT_SYSTEM_PROMPT;

    const fullPrompt = `
СИСТЕМА (инструкции):
${system}

ИСТОРИЯ ДИАЛОГА:
${historyText}

НОВЫЙ ВОПРОС КЛИЕНТА:
Клиент: ${message}

Ответь как AI-дизайнер и AI-менеджер Madera Design:
`.trim();

    const response = await client.responses.create({
      model: "gpt-5.1",
      input: fullPrompt,
      temperature: 0.4,
      max_output_tokens: 700,
    });

    let reply = FALLBACK_REPLY;

    try {
      // Правильное извлечение текста из Responses API
      const firstMessage = response.output?.[0];
      const firstTextPart = firstMessage?.content?.find(
        (part) => part.type === "output_text"
      );

      if (
        firstTextPart &&
        typeof firstTextPart.text === "string" &&
        firstTextPart.text.trim().length
      ) {
        reply = firstTextPart.text.trim();
      }

      // На всякий случай лог, если структура поменяется
      if (!firstTextPart) {
        console.warn(
          "[Madera AI] Unexpected responses.output structure:",
          JSON.stringify(response.output, null, 2)
        );
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
