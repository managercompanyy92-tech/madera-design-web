// src/pages/api/ai-designer.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("AI_DESIGNER_ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({
      error: "AI-сервис не сконфигурирован на сервере (нет API-ключа).",
    });
  }

  try {
    const { message, history = [], systemPrompt } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Пустое сообщение." });
    }

    // ---------- собираем messages ----------
    const messages = [];

    if (systemPrompt && typeof systemPrompt === "string") {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
    }

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

    messages.push({
      role: "user",
      content: message,
    });

    // ---------- запрос в OpenAI ----------
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

    const textBody = await openaiResponse.text();

    if (!openaiResponse.ok) {
      console.error(
        "AI_DESIGNER_HTTP_ERROR",
        openaiResponse.status,
        textBody
      );
      return res.status(502).json({
        error: `Ошибка AI-сервиса (код ${openaiResponse.status}). Попробуйте ещё раз чуть позже.`,
      });
    }

    let data = null;
    try {
      data = JSON.parse(textBody);
    } catch (parseErr) {
      console.error("AI_DESIGNER_PARSE_ERROR", parseErr, textBody);
      return res.status(500).json({
        error: "Ответ AI-сервиса в неверном формате.",
      });
    }

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
          "Не получилось получить осмысленный ответ от AI-дизайнера. Попробуйте ещё раз сформулировать задачу.",
      });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI_DESIGNER_UNEXPECTED_ERROR", err);
    return res.status(500).json({
      error: "Внутренняя ошибка AI-дизайнера на сервере.",
    });
  }
}
