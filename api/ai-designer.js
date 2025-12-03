// api/ai-designer.js
// Серверная функция для Vercel (без Next.js)

// Можно сразу подключить OpenAI, но сначала сделаем рабочую заглушку,
// чтобы убедиться, что всё вообще ходит туда-обратно.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // На Vercel req.body может быть строкой — аккуратно разбираем
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { message, context } = body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "No message provided" });
    }

    // ---------- ВАРИАНТ 1. РАБОЧАЯ ЗАГЛУШКА (оставь для проверки) ----------
    const reply =
      "Я вас услышал: «" +
      message +
      "». Сейчас работаю в тестовом режиме AI-дизайнера. " +
      "Могу предложить варианты планировки, цвета и мебели под вашу задачу.";

    return res.status(200).json({ reply });

    // ---------- ВАРИАНТ 2. РЕАЛЬНЫЙ ВЫЗОВ OPENAI (включишь позже) ----------
    /*
    if (!OPENAI_API_KEY) {
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
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты AI-дизайнер интерьеров Madera Design. " +
              "Отвечай по-русски, по делу, учитывай, что клиент делает мебель на заказ.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
      }),
    });

    if (!apiResp.ok) {
      const text = await apiResp.text();
      console.error("OPENAI API ERROR:", apiResp.status, text);
      return res.status(500).json({ error: "Failed to get response from OpenAI" });
    }

    const data = await apiResp.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Не смог получить ответ от AI-дизайнера. Попробуйте ещё раз позже.";

    return res.status(200).json({ reply });
    */
  } catch (err) {
    console.error("AI_DESIGNER_HANDLER_ERROR:", err);
    return res
      .status(500)
      .json({ error: "Internal server error in ai-designer handler" });
  }
};
