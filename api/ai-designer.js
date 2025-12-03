import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI service is not configured (missing OPENAI_API_KEY)",
    });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { message, history, systemPrompt } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Empty message" });
    }

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    // Нормализация истории
    if (Array.isArray(history)) {
      history.slice(-10).forEach((msg) => {
        if (!msg) return;
        const role = msg.role === "assistant" ? "assistant" : "user";
        const text = msg.text || msg.content || "";
        if (text.trim()) {
          messages.push({ role, content: text.trim() });
        }
      });
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.7,
      max_tokens: 700,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Не удалось получить ответ.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI DESIGNER API ERROR:", err);
    return res.status(500).json({
      error: "AI service error",
    });
  }
}
