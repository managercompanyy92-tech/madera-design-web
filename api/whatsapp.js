export default async function handler(req, res) {
  try {
    const message = req.body?.Body || req.body?.message || "";

    // отправляем в твой AI
    const aiResponse = await fetch("https://madera-design-web.vercel.app/api/ai-designer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await aiResponse.json();

    return res.status(200).json({
      reply: data.reply || data.text || "Ответ от AI"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Ошибка AI"
    });
  }
}
