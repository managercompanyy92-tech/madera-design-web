// api/chat.js — серверless-функция для Vercel

export default async function handler(req, res) {
  console.log('[Madera AI] Incoming request to /api/chat:', req.method);

  // Разрешаем только POST
  if (req.method !== 'POST') {
    console.warn('[Madera AI] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('[Madera AI] OPENAI_API_KEY is missing in environment variables');
      return res.status(500).json({
        error: 'Server configuration error: missing OPENAI_API_KEY',
      });
    }

    // Тело запроса от фронтенда
    const body = req.body || {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      console.warn('[Madera AI] Empty or missing "message" in request body:', body);
      return res.status(400).json({ error: 'Empty message' });
    }

    console.log('[Madera AI] User message:', message);

    // Запрос к OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Ты — AI-ассистент мебельной студии Madera в Душанбе. ' +
              'Отвечай кратко, по делу, дружелюбно. ' +
              'Можешь ориентировочно оценивать стоимость мебели, но всегда добавляй, ' +
              'что точный расчёт сделает менеджер после замера.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    const data = await openaiRes.json();

    console.log('[Madera AI] OpenAI status code:', openaiRes.status);
    console.log(
      '[Madera AI] OpenAI response (first 500 chars):',
      JSON.stringify(data).slice(0, 500)
    );

    if (!openaiRes.ok) {
      console.error('[Madera AI] OpenAI error response:', data);
      return res.status(500).json({
        error: 'OpenAI request failed',
        details: data?.error || null,
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error('[Madera AI] No reply content in OpenAI response:', data);
      return res.status(500).json({ error: 'No reply from language model' });
    }

    console.log('[Madera AI] Reply to user:', reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[Madera AI] Unexpected error in /api/chat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
