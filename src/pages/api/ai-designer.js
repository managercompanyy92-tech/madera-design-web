// pages/api/ai-designer.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. Проверяем ключ
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("AI_DESIGNER_ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({
      error: "AI service is not configured on the server",
    });
  }

  try {
    const { message, history, systemPrompt } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Empty message" });
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
      // Берём только последние 10 сообщений, чтобы не раздувать запрос
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

    messages.push({
      role: "user",
      content: message,
    });

    // 3. Запрос к OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // можно заменить на нужную модель
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text().catch(() => "");
      console.error("AI_DESIGNER_HTTP_ERROR", openaiResponse.status, errorText);
      return res.status(502).json({
        error: "Upstream AI error",
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
      console.warn("AI_DESIGNER_EMPTY_REPLY", data);
      return res.status(200).json({
        reply: "Не получилось получить ответ от AI-дизайнера. Попробуйте ещё раз сформулировать задачу.",
      });
    }

    // 4. Отдаём ответ фронту
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI_DESIGNER_UNEXPECTED_ERROR", err);
    return res.status(500).json({
      error: "Unexpected server error",
    });
  }
}
