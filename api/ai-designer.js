// api/ai-designer.js

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, context } = req.body || {};

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "No message" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // 1) Если ключа нет — отдаём демонстрационный ответ, но СТАТУС 200
  if (!apiKey) {
    const demoReply =
      "Я AI-дизайнер Madera Design. Сейчас работаю в демо-режиме без подключения к ИИ-сервису, " +
      "но уже могу подсказать базовые вещи по планировке и мебели. " +
      "Напишите, какая комната, стиль и примерный бюджет — предложу варианты, " +
      "а менеджер уточнит детали и подготовит просчёт.";

    res.status(200).json({ reply: demoReply });
    return;
  }

  // 2) Основной вариант: вызываем OpenAI
  try {
    const llmRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Ты AI-дизайнер мебели Madera Design. " +
              "Помогаешь клиентам с планировкой, цветами, материалами и примерным бюджетом. " +
              "Отвечай конкретно, на 3–6 предложений, с учётом задач клиента. " +
              "Если данных мало — задай 2–3 уточняющих вопроса.",
          },
          {
            role: "user",
            content: context
              ? `Контекст: ${context}\n\nВопрос клиента: ${message}`
              : message,
          },
        ],
      }),
    });

    // Если OpenAI вернул ошибку — логируем, но клиенту всё равно даём нормальный ответ (200)
    if (!llmRes.ok) {
      const text = await llmRes.text();
      console.error("OpenAI error:", llmRes.status, text);

      const fallbackReply =
        "Я получил ваш запрос, но сейчас не могу обратиться к ИИ-сервису. " +
        "Могу предложить базовые рекомендации: продумать хранение, удобство проходов и эргономику. " +
        "Опишите, пожалуйста, размеры комнаты и желаемый стиль — мы подготовим варианты и свяжемся с вами.";

      res.status(200).json({ reply: fallbackReply });
      return;
    }

    const data = await llmRes.json();

    // Структура Responses API: data.output[0].content[...]
    const outputItem = data.output && data.output[0];
    let reply = "";

    if (outputItem && Array.isArray(outputItem.content)) {
      const textPart = outputItem.content.find(
        (c) => c.type === "output_text" && c.text && c.text.length
      );
      reply = textPart?.text || "";
    }

    if (!reply) {
      reply =
        "Я получил ваш вопрос, но не смог сформировать ответ. " +
        "Попробуйте переформулировать задачу или написать её чуть подробнее.";
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("AI-designer handler error:", error);

    // Любую ошибку гасим и возвращаем вменяемый текст с 200
    const fallbackReply =
      "Извините, при обработке запроса возникла техническая ошибка. " +
      "Тем не менее вы можете описать комнату, стиль и бюджет — мы свяжемся с вами, " +
      "чтобы предложить конкретные решения.";

    res.status(200).json({ reply: fallbackReply });
  }
}
