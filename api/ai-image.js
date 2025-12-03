export const config = {
  runtime: "edge",
};

// Генератор изображений для AI-дизайнера Madera Design
export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
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

    // Формируем контекст для Madera Design
    const stylePrompt = `
Ты — старший интерьерный дизайнер компании Madera Design (г. Душанбе).
Создай ультрареалистичный интерьер с учётом следующего запроса клиента.

Требования к изображению:
- Премиальное качество, фотореализм (8K детализация)
- Мягкое тёплое освещение
- Натуральные материалы: дерево, камень, стекло, металл
- Цветовая гамма: фирменные тона Madera Design (графит, дерево, тёплый оранжевый)
- Аккуратная композиция, перспективная камера
- Без текста, людей, водяных знаков, логотипов
- Современный минимализм в архитектуре и мебели
- Атмосфера уюта и эстетики

Клиент просит: ${prompt}.
`;

    // Запрос к OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: stylePrompt,
          size: "1024x1024",
          quality: "hd",
          n: 1,
        }),
      }
    );

    const data = await openaiResponse.json();

    if (!data?.data?.[0]?.url) {
      return new Response(
        JSON.stringify({
          error: "Image generation failed",
          details: data,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        imageUrl: data.data[0].url,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("AI_IMAGE_ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Server error", detail: err.message }),
      { status: 500 }
    );
  }
}
