// api/ai-image.js
// Серверная функция для генерации визуализаций (AI-дизайнер Madera Design)

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Простая детекция языка последнего сообщения
function detectLanguage(text) {
  const hasCyrillic = /[А-Яа-яЁёҒғҚқҶҷҲҳӢӣҶҷӮӯ]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);

  if (hasCyrillic && !hasLatin) {
    // Русский или таджикский. Очень грубо: если много типичных таджикских слов
    const tjPatterns = /(шероз|хона|девор|курси|мебел|ҳуҷра|ошхона|меҳмонхона|ҷойи хоб)/i;
    return tjPatterns.test(text) ? "tj" : "ru";
  }
  if (hasLatin && !hasCyrillic) return "en";
  return "ru"; // дефолт
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("AI_IMAGE_ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({
      error: "AI-сервис для визуализаций временно не настроен (нет API-ключа).",
    });
  }

  try {
    const { messages, imageRequest } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    // Последнее пользовательское сообщение
    const lastUser =
      [...messages].reverse().find((m) => m.role === "user") || messages[messages.length - 1];

    const userText = String(lastUser.content || "");
    const lang = detectLanguage(userText);

    // -----------------------
    // ЕСЛИ НУЖНА ИМЕННО КАРТИНКА
    // -----------------------
    if (imageRequest) {
      // 1) Формируем англоязычный промпт для модели картинок
      const imagePrompt = `
Ultra realistic interior render for a custom-made furniture project.

Project context from client (may be Russian or Tajik, translate mentally to English):
"${userText}"

Requirements:
- photorealistic visualization;
- premium apartment interior in Dushanbe;
- stylish built-in furniture (kitchen, wardrobe, living room etc. depending on context);
- pleasant warm lighting;
- composition suitable for portfolio of a high-end furniture studio;
- no people in the frame.

Do NOT add text in the picture.
`;

      // 2) Генерируем картинку
      const imgResponse = await client.images.generate({
        model: "gpt-image-1",
        prompt: imagePrompt,
        size: "1024x1024",
      });

      const imageUrl = imgResponse.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL in OpenAI response");
      }

      // 3) Короткая подпись к визуализации на языке клиента
      let captionSystem;
      if (lang === "tj") {
        captionSystem = `
Шумо ассистенти AI аз ширкати Madera Design ҳастед.
Навиштаҷоти кӯтоҳ барои визуализатсияи тарҳи мебел месозед.
Ҳама вақт бо забони тоҷикӣ, услуби расмӣ ва дӯстона ҷавоб диҳед.
`;
      } else if (lang === "en") {
        captionSystem = `
You are an AI assistant of Madera Design.
Write a very short description of the generated interior visualization.
Always answer in English in a polite, business style.
`;
      } else {
        captionSystem = `
Ты — AI-ассистент компании Madera Design.
Составь очень короткое описание визуализации интерьера.
Всегда отвечай по-русски, деловым, но дружелюбным тоном.
`;
      }

      const captionCompletion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.6,
        max_tokens: 120,
        messages: [
          { role: "system", content: captionSystem },
          {
            role: "user",
            content: userText || "Кратко опиши визуализацию интерьера для клиента.",
          },
        ],
      });

      const caption =
        captionCompletion.choices?.[0]?.message?.content?.trim() ||
        (lang === "tj"
          ? "Визуализатсияи тарҳи пешниҳодшуда."
          : lang === "en"
          ? "Visualization of a proposed interior design."
          : "Визуализация предложенного дизайна интерьера.");

      return res.status(200).json({
        type: "image",
        url: imageUrl,
        text: caption,
      });
    }

    // -----------------------
    // ЕСЛИ imageRequest = false (подстраховка)
    // Текстовый ответ AI-дизайнера
    // -----------------------
    const SYSTEM_PROMPT = `
Ты — AI-дизайнер компании Madera Design (Душанбе).
Отвечаешь кратко и по делу, помогаешь с идеями планировки и стилем
для корпусной мебели: кухни, гардеробные, спальни, прихожие, гостиные, детские.

Важно:
- Говори на языке последнего сообщения клиента.
- Не называй точные цены здесь — для точного расчёта клиенту нужен AI-ассистент.
- Даёшь рекомендации по стилю, цветам, материалам и функционалу мебели.
`;

    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      })),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: openaiMessages,
      temperature: 0.5,
      max_tokens: 600,
    });

    const textReply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Извините, сейчас не удалось получить ответ. Попробуйте ещё раз.";

    return res.status(200).json({
      type: "text",
      text: textReply,
    });
  } catch (err) {
    console.error("AI_IMAGE_ERROR:", err);
    return res.status(500).json({
      error: "Извините, сервис визуализаций временно недоступен. Попробуйте позже.",
    });
  }
}
