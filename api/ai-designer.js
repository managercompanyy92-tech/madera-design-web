// api/ai-designer.js
// Vercel serverless-функция для AI-дизайнера Madera Design

// Важно: на Vercel должен быть задан ENV-параметр OPENAI_API_KEY

module.exports = async (req, res) => {
  // Разрешаем только POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("AI_DESIGNER_ERROR: OPENAI_API_KEY is not set");
    return res
      .status(500)
      .json({ error: "AI-сервис не настроен на сервере (нет ключа OpenAI)." });
  }

  try {
    // На Vercel body может быть уже объектом, а может быть строкой
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("AI_DESIGNER_PARSE_ERROR:", e);
        return res.status(400).json({ error: "Некорректный формат запроса." });
      }
    }

    const { message, history, systemPrompt } = body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Пустое сообщение." });
    }

    // Сборка сообщений для модели
    const messages = [];

    // 1) system-промпт — всё ТЗ для AI-дизайнера (роль, стиль, правила)
    if (systemPrompt && typeof systemPrompt === "string") {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // 2) История диалога (только последние 10 обменов)
    if (Array.isArray(history)) {
      const trimmed = history.slice(-10);
      for (const item of trimmed) {
        if (!item || typeof item.text !== "string") continue;
        const role = item.role === "assistant" ? "assistant" : "user";
        messages.push({
          role,
          content: item.text,
        });
      }
    }

    // 3) Текущее сообщение пользователя
    messages.push({
      role: "user",
      content: message,
    });

    // Вызов OpenAI Chat Completions
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text().catch(() => "");
      console.error(
        "AI_DESIGNER_HTTP_ERROR",
        openaiResponse.status,
        errorText
      );
      return res
        .status(502)
        .json({ error: "Ошибка внешнего AI-сервиса. Попробуйте позже." });
    }

    const data = await openaiResponse.json();

    const reply =
      data &&
      Array.isArray(data.choices) &&
      data.choices[0] &&
      data.choices[0].message &&
      typeof data.choices[0].message.content === "string"
        ? data.choices[0].message.content.trim()
        : "";

    if (!reply) {
      console.warn("AI_DESIGNER_EMPTY_REPLY", data);
      return res.status(200).json({
        reply:
          "Не получилось получить содержательный ответ от AI-дизайнера. Попробуйте ещё раз переформулировать запрос.",
      });
    }

    // Успешный ответ фронту
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI_DESIGNER_UNEXPECTED_ERROR", err);
    return res
      .status(500)
      .json({ error: "Неожиданная ошибка сервера AI-дизайнера." });
  }
};
