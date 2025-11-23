// api/chat.js — серверлес-функция для Vercel

export default async function handler(req, res) {
  console.log("[Madera AI] Incoming request:", req.method, req.url);

  // Разрешаем только POST-запросы
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("[Madera AI] ERROR: OPENAI_API_KEY is missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { message } = req.body || {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // -------------------------------------------------------------------
    // SYSTEM PROMPT С УЧЁТОМ ВАШЕГО ПРАЙСА
    // -------------------------------------------------------------------
    const systemPrompt = `
Ты — AI-ассистент мебельной студии Madera в Душанбе.

Твоя задача — помогать клиентам с ориентировочной стоимостью,
материалами и планировкой кухонь, шкафов и другой корпусной мебели.

ИСПОЛЬЗУЙ ТОЛЬКО СЛЕДУЮЩУЮ ЦЕНОВУЮ МОДЕЛЬ MADERA
(цены фиксированные за 1 погонный метр, в сомони):

1) Тариф «ЛДСП / ЛДСП» — 4000 сомони за погонный метр.
   Состав:
   - корпус: российский ЛДСП;
   - фасады: российский ЛДСП;
   - фурнитура: бренд Blum или аналогичные бренды российских производителей;
   - если это кухонный гарнитур, столешница влагостойкая.

2) Тариф «ЛДСП / МДФ» — 5000 сомони за погонный метр.
   Состав:
   - корпус: российский ЛДСП;
   - фасады: турецкий МДФ;
   - фурнитура: аналогичного уровня;
   - если это кухонный гарнитур, столешница влагостойкая.

ПРАВИЛА РАСЧЁТА:

- Если клиент указывает длину (в погонных метрах) и тип материалов,
  внимательно пойми, о каком именно тарифе речь («ЛДСП / ЛДСП» или «ЛДСП / МДФ»)
  и посчитай стоимость по формуле:
  цена = кол-во метров × цена за метр выбранного тарифа.

  Пример: 5 метров кухни «ЛДСП / ЛДСП»:
  5 × 4000 = 20000 сомони.

- Если клиент не указал материалы, но спросил «сколько стоит кухня/шкаф X метров?»:
  1) посчитай стоимость по обоим тарифам:
     - вариант 1: X × 4000 сомони;
     - вариант 2: X × 5000 сомони;
  2) дай ответ диапазоном, например:
     «Примерно от 20000 до 25000 сомони за 5 метров,
      в зависимости от выбранного материала фасадов (ЛДСП или МДФ)».

- Не придумывай других цен за метр, кроме 4000 и 5000 сомони.
- Если клиент спрашивает про другие изделия (гардеробные, сложные формы),
  можешь ориентироваться на те же цены за погонный метр и пояснить,
  что финальная стоимость немного зависит от сложности и наполнения.

- ВСЕГДА после ценового ответа добавляй фразу:
  «Точный расчёт и финальную цену вам назовёт менеджер после замера.»

СТИЛЬ ОТВЕТОВ:

- Отвечай на понятном русском языке, дружелюбно, но по делу.
- Без Markdown, только обычный текст.
- Если нужно, задай 1–2 уточняющих вопроса (тип мебели, материалы, длина),
  но не уходи в длинные анкеты.
    `.trim();

    // Логируем входящее сообщение
    console.log("[Madera AI] User message:", message);

    // Запрос к OpenAI Chat Completions
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3,  // более стабильные ответы
        max_tokens: 600
      })
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("[Madera AI] OpenAI API error:", openaiRes.status, errorText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const data = await openaiRes.json();
    console.log("[Madera AI] OpenAI raw response:", JSON.stringify(data));

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Извините, произошла ошибка. Попробуйте чуть позже.";

    console.log("[Madera AI] Final reply:", reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("[Madera AI] SERVER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
