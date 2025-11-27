// api/ai-designer.js
// Backend для AI-дизайнера — принимает текст, файлы и голосовые сообщения,
// вызывает OpenAI и возвращает ответ.

const multiparty = require("multiparty");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  // Разрешаем только POST
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

      // Текстовое сообщение пользователя
      const userText = fields?.message?.[0] || "";

      // Собираем информацию о файлах (фото, PDF, видео, голос и т.д.)
      const uploadedFiles = [];
      Object.values(files || {}).forEach((arr) => {
        arr.forEach((f) => {
          uploadedFiles.push({
            filename: f.originalFilename,
            type: f.headers["content-type"],
            size: f.size,
          });
        });
      });

      // Вызываем OpenAI — простой промпт под интерьер
      let aiReply = "";
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Ты — AI-дизайнер интерьеров Madera Design. " +
                "Отвечай кратко, по делу, на понятном русском. " +
                "Давай конкретные идеи по планировке, цветам и мебели. " +
                "Если упоминаются вложенные файлы, учитывай их как описание, " +
                "но не придумывай детали, которых нет в запросе.",
            },
            {
              role: "user",
              content:
                userText && userText.trim().length > 0
                  ? userText
                  : "Клиент не написал текст, просто отправил файлы. Дай общий совет по дизайну.",
            },
          ],
        });

        aiReply =
          completion.choices?.[0]?.message?.content ||
          "Я получил ваш запрос и подготовлю предложения по дизайну.";
      } catch (openaiError) {
        console.error("OPENAI_ERROR:", openaiError);
        return res.status(500).json({
          reply:
            "Сервис ИИ временно недоступен. Попробуйте ещё раз чуть позже.",
        });
      }

      // Успешный ответ
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
      reply: "Ошибка сервера. Попробуйте позже.",
    });
  }
};
