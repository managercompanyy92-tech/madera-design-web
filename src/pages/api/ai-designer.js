import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OPENAI_API_KEY missing");
    return res.status(500).json({
      error: "AI service is not configured",
    });
  }

  const client = new OpenAI({ apiKey });

  try {
    const { message, history, systemPrompt } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Empty message" });
    }

    // Формируем запрос
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    if (Array.isArray(history)) {
      const trimmed = history.slice(-10);
      for (const h of trimmed) {
        if (!h || !h.text) continue;
        messages.push({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.text,
        });
      }
    }

    messages.push({ role: "user", content: message });

    // Запрос к модели
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({ reply: reply.trim() });
  } catch (err) {
    console.error("AI_DESIGNER_SERVER_ERROR", err);
    return res.status(500).json({
      error: "AI service error",
    });
  }
}
