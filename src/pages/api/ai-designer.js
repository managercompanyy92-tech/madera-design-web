// src/pages/api/ai-designer.js

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Проверяем ключ OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("AI_DESIGNER_ERROR: OPENAI_API_KEY is not set");

    // Важно: всегда 200, чтобы фронт не падал в !response.ok
    return res.status(200).json({
      error:
        "AI-сервис пока не настроен на сервере. Напишите задачу менеджеру — мы поможем вручную.",
    });
  }

  try {
    const { message, history, systemPrompt } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(200).json({
        error: "Сообщение пустое. Напишите, пожалуйста, задачу подробнее.",
      });
    }

    // 2. Собираем сообщения для модели
    const messages = [];

    if (systemPrompt && typeof systemPrompt === "string") {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    if (Array.isArray(history)) {
      const trimmed = history.slice(-10); // не раздуваем контекст
      for (const item of trimmed) {
        if (!item || typeof item.text !== "string") continue;
        const role = item.role === "assistant" ? "assistant" : "user";
        messages.push({
          role,
          content: item.text,
        });
      }
    }

    messages.push({
      role: "user",
      content: message,
    });

    // 3. Запрос к OpenAI (chat completions)
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // при желании можно вынести в ENV
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

      // Возвращаем понятный текст в поле error, но статус 200
      return res.status(200).json({
        error:
          "Сейчас не получается связаться с AI-дизайнером. Попробуйте ещё раз чуть позже.",
      });
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
      console.warn("AI_DESIGNER_EMPTY_REPLY", JSON.stringify(data || {}));

      return res.status(200).json({
        error:
          "Не получилось получить понятный ответ от AI-дизайнера. Попробуйте задать вопрос чуть иначе.",
      });
    }

    // 4. Успешный ответ
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI_DESIGNER_UNEXPECTED_ERROR", err);

    // Любая непойманная ошибка — тоже 200 + текст в error
    return res.status(200).json({
      error:
        "Похоже, есть временная техническая проблема. Попробуйте ещё раз чуть позже.",
    });
  }
}
