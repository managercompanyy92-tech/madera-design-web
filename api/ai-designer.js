// api/ai-designer.js
// Vercel Serverless Function: принимает JSON { message } и возвращает ответ от OpenAI

let openaiClientPromise;

/**
 * Ленивое создание клиента OpenAI (ESM-библиотека внутри CommonJS файла)
 */
async function getOpenAIClient() {
  if (!openaiClientPromise) {
    openaiClientPromise = import("openai").then(({ default: OpenAI }) => {
      return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    });
  }
  return openaiClientPromise;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const openai = await getOpenAIClient();

    // Настраиваем промпт под твой кейс (AI-дизайнер мебели / интерьера)
    const systemPrompt =
      "Ты AI-дизайнер Madera. Ты помогаешь клиентам " +
      "подбирать материалы, цвета и ориентировочную стоимость " +
      "корпусной мебели на заказ в Душанбе. Отвечай кратко, по делу, " +
      "на русском языке, дружелюбно и профессионально. " +
      "Если не хватает данных (нет размеров, материалов и т.п.), " +
      "задай уточняющие вопросы.";

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Разбор ответа из OpenAI Responses API
    let reply = "";

    if (response.output && Array.isArray(response.output)) {
      reply = response.output
        .flatMap((item) => item.content || [])
        .map((block) => (block.text && block.text.value) || "")
        .join("\n")
        .trim();
    }

    if (!reply) {
      reply =
        "Мне не удалось сформировать ответ. Попробуйте переформулировать запрос или указать размеры и пожелания.";
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI Designer error:", error);
    res.status(500).json({
      error: "AI error",
      reply:
        "Извините, сейчас сервис AI-дизайнера временно недоступен. Попробуйте ещё раз чуть позже.",
    });
  }
};
