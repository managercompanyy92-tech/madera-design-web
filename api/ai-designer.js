// pages/api/ai-designer.js
// Серверный обработчик запросов от AI-дизайнера

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "No message provided" });
    }

    // ----- Вариант 1. Заглушка (можно оставить, чтобы просто проверить, что всё работает) -----
    // Когда убедишься, что всё ок, можно заменить на вызов OpenAI (см. ниже Вариант 2).

    const reply =
      "Я вас услышал: «" +
      message +
      "». Сейчас это тестовый ответ сервера AI-дизайнера. " +
      "Можем настроить детальную логику под ваши задачи (кухни, шкафы, расчёты и т.д.).";

    return res.status(200).json({ reply });

    // ----- Вариант 2. Реальный вызов OpenAI (раскомментировать при необходимости) -----
    /*
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    }

    const prompt =
      (context ? context + "\n\n" : "") +
      "Сообщение клиента: " +
      message;

    const apiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer "openaiKey,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты AI-дизайнер интерьеров Madera Design. " +
              "Отвечай коротко, по делу, на русском, предлагая варианты мебели и планировок.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
      }),
    });

    if (!apiResp.ok) {
      const text = await apiResp.text();
      console.error("OPENAI API ERROR:", apiResp.status, text);
      return res
        .status(500)
        .json({ error: "Failed to get response from OpenAI" });
    }

    const data = await apiResp.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Не удалось получить ответ от AI-дизайнера. Попробуйте позже.";

    return res.status(200).json({ reply });
    */
  } catch (err) {
    console.error("AI_DESIGNER_HANDLER_ERROR:", err);
    return res
      .status(500)
      .json({ error: "Internal server error in ai-designer handler" });
  }
}
