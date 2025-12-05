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

  try {
    const fullPrompt = `
Премиальная фотореалистичная визуализация интерьера Madera Design.
Высокая детализация, качественный свет, дорогие материалы.
Сцена: ${prompt}
`.trim();

    const imageResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      size: "1024x1024",
      n: 1,
    });

    const first = imageResponse.data?.[0];

    let imageUrl = first?.url || null;

    if (!imageUrl && first?.b64_json) {
      imageUrl = `data:image/png;base64,${first.b64_json}`;
    }

    if (!imageUrl) {
      return res
        .status(500)
        .json({ error: "Image generation failed: no URL returned." });
    }

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("IMAGE_ERROR:", error);
    return res.status(500).json({ error: "Image generation error" });
  }
}
