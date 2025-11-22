// api/chat.js — серверless-функция для Vercel

export default async function handler(req, res) {
  console.log('[Madera AI] Incoming request:', req.method, req.url);

  // Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Берём ключ из переменной окружения Vercel
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('[Madera AI] ERROR: OPENAI_API_KEY is not set');
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server' });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'No message provided' });
    }

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
              'Отвечай кратко, по делу и дружелюбно. Если вопрос не про мебель, ' +
              'вежливо возвращай разговор к теме мебели и кухни.',
          },
          { role: 'user', content: message },
        ],
        temperature: 0.4,
      }),
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text();
      console.error('[Madera AI] OpenAI API error:', openaiRes.status, text);
      return res.status(500).json({ error: 'OpenAI API error' });
    }

    const data = await openaiRes.json();
    console.log('[Madera AI] Response data:', JSON.stringify(data));

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      'Извините, произошла ошибка. Попробуйте позже.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[Madera AI] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
