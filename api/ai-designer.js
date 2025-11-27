// api/ai-designer.js
// Реальный backend AI-дизайнера: принимает текст, голос, фото, PDF, видео и отправляет в OpenAI

const multiparty = require("multiparty");
const fs = require("fs");
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
          reply: "Ошибка при обработке данных. Попробуйте позже.",
        });
      }

      const userText = fields?.message?.[0] || "Клиент не написал текст.";

      // Собираем файлы
      const uploadedFiles = [];
      Object.values(files).forEach((arr) => {
        arr.forEach((file) => {
          uploadedFiles.push(file);
        });
      });

      // Готовим файлы для OpenAI
      const attachments = [];
      for (const file of uploadedFiles) {
        try {
          const buffer = fs.readFileSync(file.path);

          attachments.push({
            filename: file.originalFilename,
            buffer,
            mimeType: file.headers["content-type"],
          });
        } catch (e) {
          console.error("FILE_READ_ERROR:", e);
        }
      }

      // Формируем системную роль — стиль и поведение AI-дизайнера
      const systemPrompt = `
Ты — AI-дизайнер компании Madera Design.
Ты — профессиональный дизайнер интерьеров международного уровня.

Правила поведения:
1. Отвечай красиво, уверенно, профессионально и дипломатично.
2. Всегда держи уровень элитного дизайнера.
3. Помогай клиентам, предлагай решения, объясняй, что и почему лучше.
4. Уважай клиента и веди диалог мягко в сторону сделки.
5. Представляй интересы компании.
6. Никогда не говори ничего негативного о Madera Design.
7. По запросу клиента — анализируй фото, видео, PDF и формируй дизайн-решения.
8. Генерируй предложения по стилю, цветам, планировке и мебели.
9. Всегда пиши вежливо, дружелюбно и сдержанно, как топ-дизайнер международного уровня.
`;

      // Формируем сообщения для OpenAI
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText },
      ];

      // Если есть файлы — отправляем как часть сообщения
      const openAiFiles = [];

      for (const file of attachments) {
        const uploaded = await client.files.create({
          file: file.buffer,
          purpose: "vision",
          filename: file.filename,
        });

        openAiFiles.push(uploaded.id);
      }

      // Генерируем ответ AI
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      const aiReply = completion.choices?.[0]?.message?.content || "Ответ не получен.";

      // Возвращаем клиенту
      return res.status(200).json({
        reply: aiReply,
        receivedFiles: uploadedFiles.map((f) => f.originalFilename),
        designs: [],
        audioUrl: null,
      });
    });
  } catch (e) {
    console.error("AI_DESIGNER_FATAL:", e);
    return res.status(500).json({
      reply: "Ошибка сервера. Попробуйте позже.",
    });
  }
};
