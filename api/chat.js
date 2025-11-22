// api/chat.js — серверная функция Vercel для Madera AI

export default async function handler(req, res) {
  console.log('[Madera AI] Incoming request:', req.method, req.url);

  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('[Madera AI] OPENAI_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error: missing OPENAI_API_KEY' });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      console.warn('[Madera AI] Invalid message in request body:', req.body);
      return res.status(400).json({ error: 'Invalid "message" field' });
    }

    const systemPrompt = `
Ты — AI-ассистент студии мебельного дизайна Madera в Душанбе.
Твоя задача — помогать клиентам с ориентировочной оценкой стоимости корпусной мебели,
подсказками по материалам, фурнитуре и планировке.

Важные правила:
1. ВСЕГДА отвечай по-русски.
2. Всегда напоминай, что расчёт ориентировочный, а окончательную цену и замер делает менеджер.
3. Если не хватает данных (размер, форма, материалы, фурнитура) — задавай уточняющие вопросы.
4. Не давай юридических советов и не обсуждай темы, не связанные с мебелью или ремонтом.
5. Цены давай примерно, в сомони, с нормальной человеческой формулировкой.
6. В конце ответа мягко предложи оставить заявку в разделе «Заказ» на сайте.

Если пользователь отходит от темы мебели и ремонта, вежливо верни диалог обратно к теме
мебели на заказ и услуг студии Madera.
    `.trim();

    // Формируем сообщения для Chat Completions
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: message }
    ];

    console.log('[Madera AI] Sending request to OpenAI...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',           // можно заменить на gpt-4.1-mini при желании
        messages,
        temperature: 0.4,
        max_tokens: 600
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error('[Madera AI] OpenAI API error:', openaiResponse.status, data);
      return res.status(500).json({ error: 'AI request failed', details: data });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      'Извините, сейчас не удалось получить ответ от модели. Попробуйте ещё раз.';

    console.log('[Madera AI] Reply ready');

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[Madera AI] Unexpected server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
