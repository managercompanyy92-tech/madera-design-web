// api/chat.js
// Серверная функция для AI-ассистента Madera Design

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("CHAT_ERROR: OPENAI_API_KEY не задан");
    return res.status(500).json({
      error: "AI-сервис не настроен. Свяжитесь с администратором.",
    });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "No messages provided" });
    }

    // ----------------------------------------------------
    // СИСТЕМНЫЙ ПРОМПТ: КТО ТЫ, НАШ СЕРВИС И ПРАВИЛА
    // ----------------------------------------------------
    
const SYSTEM_PROMPT = `
Вы — AI-ассистент компании Madera Design.

ГОВОРИТЕ ТОЛЬКО НА ТОМ ЯЗЫКЕ, НА КОТОРОМ ПИШЕТ КЛИЕНТ.  
Если клиент пишет на таджикском — отвечайте полностью на таджикском.  
Если клиент пишет на русском — отвечайте на русском.  
Если клиент пишет на английском — отвечайте на английском.  

Никогда не смешивайте языки в одном ответе.

---

ВАША РОЛЬ:
- Вы AI-ассистент, AI-дизайнер и AI-менеджер Madera Design.
- Вы профессиональны, вежливы, отвечаете коротко и по делу.
- Вы помогаете клиенту понять условия работы, цены, сроки, требования к проекту.
- Всегда учитываете бизнес-политику компании.

---

СТОИМОСТЬ:
- Стандарт: 4000 сомони за 1 погонный метр
- Премиум: 5000 сомони за 1 погонный метр
- Минимальный заказ: 3 погонных метра

---

СРОКИ:
- Производство: 10–15 рабочих дней после утверждения дизайн-проекта и 100% оплаты.
- Уточняйте стиль, размеры, материалы, технику.

---

МЫ НЕ ПРИНИМАЕМ ЗАКАЗЫ:
- классический стиль
- неоклассика
- коммерческие объекты: магазины, офисы, школы, рестораны и т.д.
- декоративные элементы для фасадов
- отдельные заказы на одну кровать (односпальная, двуспальная, двухъярусная)
- заказы за пределами Душанбе
- исправление недоделок чужих мастеров
- заказы менее 3 погонных метров
- без дизайн-проекта
- мебель из дешёвых материалов
- мебель из металлоконструкций
- мебель полностью из массива дерева
- мягкая мебель (диваны, кресла)
- частичная предоплата — работаем ТОЛЬКО 100% предоплата

---

ВАЖНО:
Если клиент спрашивает что-то из запрещённого списка —  
вежливо объясните, что компания такие заказы не принимает, и предложите альтернативу (кухни, шкафы, гардеробные, прихожие, гостиные и др.).

---
`;
    // Дополнительная подсказка прямо перед вопросом:
    const LANGUAGE_ECHO_HINT = {
      role: "system",
      content: `Последний вопрос клиента: «${message}». Ответь на том же языке, на котором написан этот вопрос.`,
    };

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      LANGUAGE_ECHO_HINT,
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    // ----------------------------------------------------
    // Запрос к OpenAI
    // ----------------------------------------------------
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.4,
          max_tokens: 700,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("CHAT_ERROR: OpenAI API error:", errorText);
      return res.status(500).json({
        error: "Ошибка AI-сервиса. Попробуйте ещё раз чуть позже.",
      });
    }

    const json = await openaiResponse.json();
    const assistantMessage =
      json.choices?.[0]?.message?.content?.trim() ||
      "Извините, я сейчас не могу ответить. Попробуйте ещё раз позже.";

    // Возвращаем в формате, который ждёт фронтенд
    return res.status(200).json({
      reply: assistantMessage,
      answer: assistantMessage,
    });
  } catch (err) {
    console.error("CHAT_FATAL_ERROR:", err);
    return res.status(500).json({
      error: "Внутренняя ошибка сервера AI. Попробуйте ещё раз позже.",
    });
  }
}
