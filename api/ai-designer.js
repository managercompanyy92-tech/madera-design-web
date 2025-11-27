// api/ai-designer.js
// Backend для AI-дизайнера: принимает текст + файлы и отвечает как
// профессиональный интерьерный дизайнер от имени Madera Design.

const multiparty = require("multiparty");
const OpenAI = require("openai");

// Инициализация OpenAI по ключу из переменных окружения Vercel
const openai = new OpenAI({
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

      // Текстовое сообщение пользователя
      const userText = (fields?.message && fields.message[0]) || "";

      // Список загруженных файлов (фото, pdf, видео и т.д.)
      const uploadedFiles = [];
      if (files) {
        Object.values(files).forEach((arr) => {
          arr.forEach((f) => {
            uploadedFiles.push({
              fieldName: f.fieldName,
              filename: f.originalFilename,
              mimeType: f.headers["content-type"],
              size: f.size,
              path: f.path, // путь в tmp на сервере (Vercel)
            });
          });
        });
      }

      console.log("AI-DESIGNER TEXT:", userText);
      console.log("AI-DESIGNER FILES:", uploadedFiles);

      // Подготовим текстовое описание того, какие файлы прислал клиент,
      // чтобы ИИ мог учитывать, что у него "как будто" есть визуальные материалы.
      const filesSummary =
        uploadedFiles.length > 0
          ? uploadedFiles
              .map(
                (f, idx) =>
                  `${idx + 1}) ${f.filename} (${f.mimeType}, ~${Math.round(
                    f.size / 1024
                  )} КБ)`
              )
              .join("\n")
          : "Клиент пока не прислал файлов (фото / план / дизайн-проект).";

      // Базовый промпт — поведение AI-дизайнера
      const systemPrompt = `
Ты — AI-дизайнер компании "Madera Design" из Душанбе.

Важные правила:
1) Ведёшь себя как международный высококлассный интерьерный дизайнер и менеджер по продажам.
2) Отвечаешь на русском языке, вежливо, красиво, структурированно и короткими абзацами.
3) Глубоко понимаешь:
   - дизайн интерьера,
   - корпусную мебель,
   - эргономику,
   - освещение,
   - материалы (ЛДСП, МДФ, фурнитура Blum и т.д.).
4) Ты всегда говоришь от имени компании Madera Design и заботишься о репутации бренда.
5) В диалоге мягко ведёшь клиента к дальнейшему обсуждению проекта и к заказу,
   но без навязчивых продаж.
6) Если клиент задаёт неудобные вопросы, отвечай дипломатично, спокойно и профессионально.
7) Если клиент отправил фото, план помещения или PDF:
   - ты не видишь изображения напрямую, но можешь делать разумные предположения,
   - уточняй у клиента важные детали (размеры, высоту потолка, стиль, бюджет).
8) Ты знаешь про систему скидок Madera Design:
   - минимальный заказ — от 3 погонных метров,
   - при прямом заказе через компанию — скидка 5%,
   - при заказе по промокоду партнёра — скидка 10%,
   - партнёру начисляется 5% от суммы заказа.
9) Не придумывай конкретные факты о компании, если клиент спрашивает про то, чего нет.
   Вместо этого объясни, что лучше уточнить у живого менеджера, но помоги клиенту чем можешь.
10) Пиши так, чтобы текст можно было легко прочитать с экрана телефона.

Отвечай всегда конкретно по запросу клиента и предлагай следующий шаг:
- либо уточнить размеры/фото/бюджет,
- либо перейти к расчёту/заказу.
      `.trim();

      // Если пользователь вообще ничего не прислал — ответ по умолчанию
      const safeUserText =
        userText && userText.trim().length > 0
          ? userText.trim()
          : "Клиент пока ничего не написал, просто открыл чат.";

      // Формируем запрос к OpenAI
      let aiReplyText =
        "Сейчас временно недоступен основной AI-сервис. Попробуйте повторить запрос позже.";

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `
Сообщение клиента:
${safeUserText}

Информация о прикреплённых файлах:
${filesSummary}

Дай ответ как AI-дизайнер Madera Design.
              `.trim(),
            },
          ],
          temperature: 0.7,
          max_tokens: 700,
        });

        aiReplyText =
          completion.choices?.[0]?.message?.content?.trim() ||
          "Спасибо за сообщение. Я готов помочь с вашим интерьером и корусной мебелью.";
      } catch (apiErr) {
        console.error("OPENAI_API_ERROR:", apiErr);
        // Если что-то пошло не так с OpenAI — всё равно не заваливаем фронт
        aiReplyText =
          "Сейчас временно есть сложности с AI-сервисом. Но я всё равно могу подсказать по базовым вопросам мебели и интерьера.";
      }

      // Возвращаем ответ фронтенду
      return res.status(200).json({
        reply: aiReplyText,
        // На будущее — сюда можно добавлять ссылки на сгенерированные дизайн-картинки, pdf и т.д.
        designs: [],
        audioUrl: null,
        received: {
          text: safeUserText,
          files: uploadedFiles.map((f) => ({
            filename: f.filename,
            mimeType: f.mimeType,
            size: f.size,
          })),
        },
      });
    });
  } catch (e) {
    console.error("AI_DESIGNER_FATAL_ERROR:", e);
    return res.status(500).json({
      reply: "Произошла техническая ошибка на сервере. Попробуйте ещё раз чуть позже.",
    });
  }
};
