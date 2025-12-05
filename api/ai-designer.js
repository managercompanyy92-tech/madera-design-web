// /api/ai-designer.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// сюда потом вставишь свой длинный системный промпт
const SYSTEM_PROMPT = `Ты AI-ассистент-дизайнер и менеджер студии Madera Design.
Отвечай вежливо, по делу и коротко, если пользователь не просит подробности.`;

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history } = req.body || {};

  // Валидация сообщения
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
    // Собираем историю в текст (опционально)
    const historyText = Array.isArray(history)
      ? history
          .map((m) => {
            const role = m.role === "assistant" ? "AI" : "Клиент";
            return `${role}: ${String(m.content ?? "")}`;
          })
          .join("\n")
      : "";

    // Один большой промпт строкой — для простоты
    const fullPrompt = `
СИСТЕМА:
${SYSTEM_PROMPT}

КОНТЕКСТ (предыдущие сообщения):
${historyText || "— нет предыдущих сообщений —"}

НОВЫЙ ВОПРОС:
Клиент: ${message}

Ответь как AI-дизайнер и менеджер Madera Design.
Дай понятный, полезный и короткий ответ на русском языке.
`;

    // ВАЖНО: используем Responses API с параметром max_output_tokens
    const response = await client.responses.create({
      model: "gpt-5.1",
      input: fullPrompt, // простая строка — тип автоматически input_text
      temperature: 0.4,
      max_output_tokens: 700,
    });

    // Базовое сообщение на случай, если парсинг не удастся
    let reply =
      "Извините, сейчас не удалось получить ответ от сервиса. Попробуйте ещё раз чуть позже.";

    try {
      const firstOutput = response.output?.[0];
      const firstContent = firstOutput?.content?.[0];

      if (firstContent?.type === "output_text") {
        const text = firstContent.output_text?.text;
        if (typeof text === "string" && text.trim()) {
          reply = text.trim();
        }
      }
    } catch (parseErr) {
      console.error("[Madera AI] PARSE_OPENAI_RESPONSE_ERROR", parseErr);
    }

    // Успешный ответ бэкенда
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[Madera AI] AI_DESIGNER_ERROR", err);
    return res.status(500).json({
      error:
        "Извините, сервис временно недоступен. Попробуйте, пожалуйста, ещё раз чуть позже.",
    });
  }
}
