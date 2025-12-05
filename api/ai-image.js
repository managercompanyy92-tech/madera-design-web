// /api/ai-image.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[Madera AI IMAGE] ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    // Немного усиливаем промт под интерьер
    const fullPrompt = `
Фотореалистичная визуализация интерьера.
Премиальная корпусная мебель, аккуратный свет, реалистичные материалы.
Сцена: ${prompt}
`.trim();

    const imageResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      size: "1024x1024",
      n: 1,
    });

    const first = imageResponse.data?.[0];

    // API может вернуть url или base64, обрабатываем оба случая
    let imageUrl = first?.url || null;

    if (!imageUrl && first?.b64_json) {
      imageUrl = `data:image/png;base64,${first.b64_json}`;
    }

    if (!imageUrl) {
      console.error("[Madera AI IMAGE] NO_IMAGE_URL", imageResponse);
      return res
        .status(500)
        .json({ error: "Не удалось получить изображение от сервиса." });
    }

    return res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("[Madera AI IMAGE] GENERATION_ERROR", err);
    return res.status(500).json({
      error:
        "Извините, сервис генерации изображений временно недоступен. Попробуйте ещё раз чуть позже.",
    });
  }
}
