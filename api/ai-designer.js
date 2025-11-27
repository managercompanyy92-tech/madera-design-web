// api/ai-designer.js
// Backend AI-дизайнера Madera Design.
// Принимает текст, файлы (фото, видео, PDF, голосовые) и отправляет запрос в OpenAI.
// Сейчас ИИ работает по тексту + описанию вложений.
// Анализ самих картинок и PDF подключим на следующем шаге.

const multiparty = require("multiparty");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("FORM_PARSE_ERROR:", err);
        return res.status(500).json({
          reply: "Ошибка при обработке данных. Попробуйте ещё раз чуть позже.",
        });
      }

      // Текст от клиента
      const userText = fields?.message?.[0] || "Клиент не написал текст.";

      // Собираем информацию о файлах (фото, видео, pdf, голос и т.д.)
      const uploadedFiles = [];
      Object.entries(files || {}).forEach(([fieldName, arr]) => {
        arr.forEach((f) => {
          uploadedFiles.push({
            field: fieldName,
            filename: f.originalFilename,
            type: f.headers["content-type"],
            size: f.size,
          });
        });
      });

      console.log("AI-DESIGNER: TEXT:", userText);
      console.log("AI-DESIGNER: FILES:", uploadedFiles);

      const filesDescription =
        uploadedFiles.length > 0
          ? "Клиент также прикрепил файлы (фото/чертежи/голос и др.): " +
            uploadedFiles
              .map((f) => `${f.filename} — ${f.type}, ~${Math.round(f.size / 1024)} КБ`)
              .join("; ") +
            ". Ты не видишь содержимое файлов, но учитывай, что это материалы по интерьеру."
          : "Клиент не прикрепил файлов.";

      // Системная роль: как должен вести себя AI-дизайнер
      const systemPrompt = `
Ты — AI-дизайнер компании Madera Design.

Твоя роль:
- Профессиональный интерьерный дизайнер международного уровня.
- Специалист по корпусной мебели и планировкам.
- Высококлассный менеджер по продажам.

Правила:
1. Отвечай красиво, уверенно, профессионально и дипломатично.
2. Объясняй решения простым языком, но на уровне эксперта.
3. Помогай клиенту сформулировать задачу, уточняй важные детали.
4. Предлагай варианты планировки, стилистики, цветовых решений и мебели.
5. Веди диалог мягко в сторону заключения сделки: предлагай следующие шаги, объясняй, как Madera Design может помочь.
6. Очень бережно относись к репутации компании Madera Design. Ничего негативного о компании не говори.
7. На неудобные вопросы отвечай спокойно и уважительно, как дипломат.
8. Если клиент прикрепил фото, чертежи или PDF, считай, что это материалы по его интерьеру, и учитывай это в рекомендациях.
9. Пиши по-русски, вежливо, структурировано и достаточно кратко.
`;

      const userMessage = `
Сообщение клиента:
${userText}

Информация о вложениях:
${filesDescription}
`;

      // Запрос к OpenAI
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });

      const aiReply =
        completion.choices?.[0]?.message?.content ||
        "Спасибо за обращение! Я готов помочь с вашим интерьером. Напишите, пожалуйста, подробнее, что вы хотите сделать.";

      return res.status(200).json({
        reply: aiReply,
        received: {
          text: userText,
          files: uploadedFiles,
        },
        audioUrl: null,
        designs: [],
      });
    });
  } catch (e) {
    console.error("AI_DESIGNER_FATAL_ERROR:", e);
    return res.status(500).json({
      reply: "Произошла внутренняя ошибка сервера. Попробуйте ещё раз немного позже.",
    });
  }
};
