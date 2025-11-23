// api/chat.js — Serverless Function для Vercel
// Расширенная версия: сегментация лида, апсейл, уведомления менеджеру

export default async function handler(req, res) {
  console.log('[Madera AI] Incoming request to /api/chat:', req.method);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid request: message is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Madera AI] ERROR: OPENAI_API_KEY is not set');
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }

    // --- Системный промпт: бизнес-логика Madera + JSON-ответ ---
    const systemPrompt = [
      'Ты — AI-ассистент мебельной студии Madera в Душанбе.',
      'Мы делаем корпусную мебель на заказ: кухни, шкафы, прихожие, гардеробные и т.д.',
      '',
      'ЦЕНООБРАЗОВАНИЕ (важно):',
      '- Базовая линия 1: примерно 4000 сомони за погонный метр, если:',
      '  корпус — российский ЛДСП, фасад — российский ЛДСП,',
      '  фурнитура — Blum или аналогичные бренды российских производителей,',
      '  для кухонь столешница — влагостойкая.',
      '',
      '- Базовая линия 2: примерно 5000 сомони за погонный метр, если:',
      '  корпус — российский ЛДСП, фасад — турецкий МДФ,',
      '  фурнитура — аналогичного уровня,',
      '  для кухонь столешница — также влагостойкая.',
      '',
      'ОРИЕНТИРОВОЧНЫЕ РАСЧЁТЫ:',
      '- Если клиент пишет «сколько стоит кухня/шкаф/прихожая X метров»,',
      '  считай ориентировочный диапазон: длина (в метрах) × 4000 / 5000 сомони.',
      '- Диапазон лучше давать как «от ... до ...» (примерно ±10–20%).',
      '- Обязательно подчёркивай, что это примерная оценка, финальную цену назовёт менеджер после замера.',
      '',
      'СЕГМЕНТАЦИЯ ЛИДА И СЦЕНАРИИ:',
      '- Одновременно с ответом клиенту ты ДОЛЖЕН вернуть структурированные данные для менеджера.',
      '- Классифицируй лида: сегмент (например, "эконом", "средний", "премиум"),',
      '  намерение (что хочет клиент), диапазон бюджета, степень готовности к заказу.',
      '- Определи, является ли лид горячим (hot_lead = true), если:',
      '  клиент пишет конкретные размеры, сроки, явно готов заказать, спрашивает про оформление/договор и т.п.',
      '',
      'ФОРМАТ ОТВЕТА (СТРОГО JSON, БЕЗ ТЕКСТА ВНЕ JSON):',
      'Верни ОДИН объект JSON без пояснений вокруг, вида:',
      '{',
      '  "answer": "Текст ответа, как ты бы написал клиенту в чат.",',
      '  "segment": "эконом | средний | премиум | неизвестно",',
      '  "intent": "краткое описание запроса клиента",',
      '  "budget_tjs": { "min": 12000, "max": 18000 },',
      '  "readiness": "низкая | средняя | высокая",',
      '  "hot_lead": true,',
      '  "next_step": "что лучше предложить клиенту сделать дальше",',
      '  "manager_note": "краткий конспект для менеджера: что важно учесть, что предложить",',
      '  "products": ["кухня ЛДСП", "шкаф-купе"],',
      '  "upsell": ["подсветка верхних шкафов", "органайзеры в ящики"]',
      '}',
      '',
      'Требования:',
      '- Строго соблюдай JSON-формат.',
      '- Внутри строк не используй кавычки, которые ломают JSON. Переносы строк допускаются только в "answer" и "manager_note".',
      '- Если чего-то не знаешь, ставь null или "неизвестно".'
    ].join('\n');

    // --- История для контекста (опционально) ---
    const historyMessages = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              m &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string'
          )
          .slice(-8) // максимум 8 последних сообщений
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

    // --- Запрос в OpenAI ---
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: message }
        ],
        temperature: 0.4
      })
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error('[Madera AI] OpenAI API error:', openaiRes.status, errorText);
      return res.status(500).json({ error: 'OpenAI API error' });
    }

    const data = await openaiRes.json();
    console.log('[Madera AI] Raw OpenAI response:', JSON.stringify(data, null, 2));

    let rawContent = data?.choices?.[0]?.message?.content || '';
    rawContent = rawContent.trim();

    // Убираем ```json … ``` если модель вдруг их поставила
    if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error('[Madera AI] JSON parse error, fallback to plain text:', e);
      parsed = {
        answer:
          rawContent ||
          'Извините, произошла ошибка при обработке запроса. Менеджер свяжется с вами для уточнения деталей.',
        segment: 'неизвестно',
        intent: 'неизвестно',
        budget_tjs: null,
        readiness: 'средняя',
        hot_lead: false,
        next_step: 'Предложить клиенту оставить контакты для точного расчёта.',
        manager_note: 'Модель вернула невалидный JSON, проверьте логи.',
        products: [],
        upsell: []
      };
    }

    const {
      answer,
      segment,
      intent,
      budget_tjs,
      readiness,
      hot_lead,
      next_step,
      manager_note,
      products,
      upsell
    } = parsed;

    const reply =
      typeof answer === 'string' && answer.trim()
        ? answer.trim()
        : 'Спасибо за вопрос! Менеджер свяжется с вами для уточнения деталей и расчёта.';

    // --- Структурированный лог для аналитики ---
    console.log('[Madera AI] Lead summary:', {
      message,
      segment,
      intent,
      budget_tjs,
      readiness,
      hot_lead,
      next_step,
      products,
      upsell
    });

    // --- Уведомления менеджеру / CRM-вебхук для горячих лидов ---
    if (hot_lead === true) {
      await notifyManagerAndCrm({
        message,
        reply,
        segment,
        intent,
        budget_tjs,
        readiness,
        hot_lead,
        next_step,
        manager_note,
        products,
        upsell
      });
    }

    // --- Ответ фронтенду ---
    return res.status(200).json({
      reply,
      segment: segment || null,
      intent: intent || null,
      budget_tjs: budget_tjs || null,
      readiness: readiness || null,
      hot_lead: !!hot_lead,
      next_step: next_step || null,
      manager_note: manager_note || null,
      products: Array.isArray(products) ? products : [],
      upsell: Array.isArray(upsell) ? upsell : []
    });
  } catch (error) {
    console.error('[Madera AI] ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Уведомление менеджера и интеграция с CRM (через вебхуки/Telegram).
 * Работает только если заданы соответствующие переменные окружения.
 */
async function notifyManagerAndCrm(payload) {
  const timestamp = new Date().toISOString();

  // 1) Универсальный вебхук, например, ваш CRM или Google Apps Script
  const webhookUrl = process.env.CRM_WEBHOOK_URL || process.env.MANAGER_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'madera-design-web',
          timestamp,
          ...payload
        })
      });
      console.log('[Madera AI] CRM / Manager webhook sent');
    } catch (e) {
      console.error('[Madera AI] CRM webhook error:', e);
    }
  }

  // 2) Telegram-уведомление (опционально)
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (telegramToken && telegramChatId) {
    const textLines = [
      '🔥 *Новый горячий лид Madera*',
      '',
      `Сообщение клиента:`,
      '```',
      payload.message,
      '```',
      '',
      `Сегмент: ${payload.segment || 'неизвестно'}`,
      `Намерение: ${payload.intent || 'неизвестно'}`,
      `Готовность: ${payload.readiness || 'неизвестно'}`,
      payload.budget_tjs
        ? `Ориентировочный бюджет: ${payload.budget_tjs.min}–${payload.budget_tjs.max} сомони`
        : '',
      '',
      `Рекомендуемый следующий шаг: ${payload.next_step || 'уточнить детали и предложить замер'}`,
      '',
      payload.manager_note ? `Заметка для менеджера: ${payload.manager_note}` : ''
    ].filter(Boolean);

    const text = textLines.join('\n');

    try {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text,
          parse_mode: 'Markdown'
        })
      });
      console.log('[Madera AI] Telegram notification sent');
    } catch (e) {
      console.error('[Madera AI] Telegram notification error:', e);
    }
  }
      }
