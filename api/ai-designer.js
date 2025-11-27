// api/ai-designer.js

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Читаем "сырое" тело запроса и парсим JSON
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Bad JSON body:", e);
    return {};
  }
}

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const userMessage = (body.message || "").toString().slice(0, 2000).trim();

    if (!userMessage) {
      res.statusCode = 400;
      res.json({ error: "Пустой запрос" });
      return;
    }

    // Вызов OpenAI Responses API
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Ты — AI-дизайнер Madera Design в Душанбе.
Задача:
- Помогать клиенту с планировкой кухни, шкафов, гардеробных и другой корпусной мебели.
- Уточнять размеры, стиль, бюджет и особенности помещения.
- Предлагать 2–3 варианта решения на понятном русском.
- Отвечать коротко и по делу.
Сообщение клиента: "${userMessage}"
      `.trim(),
    });

    // Достаём текстовый ответ
    const replyText =
      response.output?.[0]?.content?.[0]?.text?.trim() ||
      "Извини, сейчас не получилось сформировать ответ. Попробуй ещё раз чуть позже.";

    res.statusCode = 200;
    res.json({ reply: replyText });
  } catch (err) {
    console.error("AI designer error:", err);
    res.statusCode = 500;
    res.json({
      error: "Внутренняя ошибка сервера AI",
    });
  }
}
