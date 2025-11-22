export default async function handler(req, res) {
  console.log("[Madera AI] Incoming request:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    console.log("[Madera AI] Message received:", message);

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("[Madera AI] ERROR: OPENAI_API_KEY not found!");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты — AI-ассистент мебельной студии Madera." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    console.log("[Madera AI] OpenAI response:", data);

    const reply =
      data.choices?.[0]?.message?.content ||
      "Извините, произошла ошибка. Попробуйте позже.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("[Madera AI] Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
