import OpenAI from "openai";

export const config = {
  runtime: "nodejs", // ВАЖНО: заставляет Vercel использовать Node, а не Edge
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024",
      quality: "high",
    });

    const imageBase64 = result.data[0].b64_json;

    return res.status(200).json({
      type: "image",
      url: `data:image/png;base64,${imageBase64}`,
      text: "Готово! Вот визуализация.",
    });
  } catch (error) {
    console.error("AI IMAGE ERROR:", error);
    return res.status(500).json({
      error: "Failed to generate image",
    });
  }
}
