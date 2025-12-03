export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405 }
      );
    }

    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is empty" }),
        { status: 400 }
      );
    }

    // Запрос к OpenAI Image Generation
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          size: "1024x1024",
          quality: "hd",
          prompt: `
Ты — профессиональный интерьерный дизайнер студии Madera Design. 
Создай ультрареалистичный интерьер. Учти требования:

— натуральные материалы
— реалистичное освещение (PBR lighting)
— фотореализм, 8K детализация
— аккуратная композиция
— стиль, который указал клиент
— мебель в стиле Madera Design
— никаких подписей, водяных знаков, текста

Клиент просит: ${prompt}.
          `,
        }),
      }
    );

    const data = await openaiResponse.json();

    if (!data?.data?.[0]?.url) {
      return new Response(
        JSON.stringify({ error: "Image generation failed", detail: data }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl: data.data[0].url }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error", detail: err.message }),
      { status: 500 }
    );
  }
}
