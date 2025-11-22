// api/chat.js
// Серверная функция Vercel для AI-чата Madera Design

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = async (req, res) => {
  // Разрешаем только POST-запросы
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  if (!OPENAI_API_KEY) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Server: OPENAI_API_KEY is not configured.",
      })
    );
    return;
  }

  try {
    // Читаем тело запроса
    let body = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", resolve);
      req.on("error", reject);
    });

    const parsed = body ? JSON.parse(body) : {};
    const message = (parsed.message || "").toString().trim();
    const leadSegment = parsed.leadSegment || "unknown";
    const context = parsed.context || {};

    if (!message) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Empty message" }));
      return;
    }

    const systemPrompt = `
Ты ассистент мебельной студии Madera Design в Душанбе.

Говоришь кратко, профессионально и дружелюбно:
- Тарифы: ориентировочно 4000 сом/п.м. (ЛДСП фасады, Стандарт) и 5000 сом/п.м. (МДФ фасады, Премиум).
- Минимальный заказ: 3 погонных метра.
- Точных цен не даёшь без замера, используешь формулировки "примерно", "ориентировочно".
- Предлагаешь следующий шаг: заявка на расчёт и замер.

Тон в зависимости от сегмента лида:
- hot: больше конкретики и призыв к действию (зафиксировать замер, обсудить детали).
- warm: больше аргументов и примеров, помогаешь сравнить варианты.
- cold: мягко вдохновляешь, даёшь идеи и общие ориентиры, без давления.

Сегмент лида: ${leadSegment}.
Контекст: ${JSON.stringify(context)}.
    `.trim();

    // Запрос к OpenAI Chat Completions
    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 350,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("OpenAI API error:", apiResponse.status, errorText);

      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "AI provider error",
        })
      );
      return;
    }

    const data = await apiResponse.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Извините, сейчас не могу ответить. Попробуйте ещё раз чуть позже.";

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ reply }));
  } catch (err) {
    console.error("API /api/chat error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Internal Server Error",
      })
    );
  }
};
