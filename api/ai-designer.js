// api/ai-designer.js
// Простейшая заглушка backend для AI-дизайнера

module.exports = async (req, res) => {
  // Разрешаем только POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ВАЖНО: пока ничего не парсим, просто возвращаем тестовый ответ
    // (чтобы проверить связку фронт → бэкенд → фронт)
    return res.status(200).json({
      reply:
        "Спасибо за обращение! Я получил ваш запрос для AI-дизайнера. " +
        "На следующем шаге мы научим бэкенд читать текст, файлы и голос " +
        "и генерировать индивидуальные решения.",
      audioUrl: null,
      designs: [],
    });
  } catch (error) {
    console.error("AI-designer API error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message || String(error),
    });
  }
};
