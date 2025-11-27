// api/ai-designer.js
// Backend для AI-дизайнера — принимает текст, файлы и голосовые сообщения

const multiparty = require("multiparty");

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

      // ТЕКСТ
      const userText = fields?.message?.[0] || null;

      // ФАЙЛЫ (фото, видео, PDF, голосовые — всё)
      const uploadedFiles = [];
      Object.values(files).forEach((arr) => {
        arr.forEach((f) => {
          uploadedFiles.push({
            filename: f.originalFilename,
            type: f.headers["content-type"],
            size: f.size,
            path: f.path,
          });
        });
      });

      console.log("TEXT:", userText);
      console.log("FILES:", uploadedFiles);

      // ТЕСТОВЫЙ ОТВЕТ
      return res.status(200).json({
        reply:
          "Файлы и сообщение успешно получены сервером. " +
          "Теперь можно переходить к подключению реального ИИ.",
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
