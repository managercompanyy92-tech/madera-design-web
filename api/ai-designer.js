// api/ai-designer.js — серверная функция для Vercel
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    let body = req.body || {};

    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const userMessage = body.message || null;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // ---------------------------------------------------------
    //  ВРЕМЕННЫЙ РАБОЧИЙ ОТВЕТ (гарантия что всё работает)
    // ---------------------------------------------------------
    const reply =
      "AI-дизайнер активен! Вы написали: «" +
      userMessage +
      "». Я готов предложить варианты планировки, цвета и мебели.";

    return res.status(200).json({ reply });

    // ---------------------------------------------------------
    // Для OpenAI раскинем потом — сначала убедимся что всё ходит
    // ---------------------------------------------------------

  } catch (error) {
    console.error("AI_DESIGNER_API_ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
