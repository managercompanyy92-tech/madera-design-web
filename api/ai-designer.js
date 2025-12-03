import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // === БАЗОВЫЕ ДАННЫЕ, КОТОРЫМИ ОБЯЗАН ОПЕРИРОВАТЬ ИИ ===

    const PRICES = {
      standard: 4000,
      premium: 5000,
    };

    const MIN_LENGTH = 3;

    const NOT_ACCEPTED = [
      "классический стиль",
      "неоклассика",
      "коммерческие объекты",
      "магазины",
      "супермаркеты",
      "офисы",
      "школы",
      "заводы",
      "фабрики",
      "рестораны",
      "декоративные элементы для экстерьера",
      "односпальная кровать",
      "двуспальная кровать",
      "двухярусная кровать",
      "заказы за пределами города Душанбе",
      "недоделки чужих мастеров",
      "металлоконструкции",
      "деревянные конструкции из массива",
      "мягкая мебель",
      "частичная предоплата",
      "дешевые материалы",
    ];

    const MEASUREMENT_PRICE = 100;

    // === ЛОГИКА ОТКАЗА НА НЕПОДХОДЯЩИЕ ЗАКАЗЫ ===

    function checkForbidden(text) {
      return NOT_ACCEPTED.find((item) =>
        text.toLowerCase().includes(item.toLowerCase())
      );
    }

    const forbidden = checkForbidden(lastUserMessage);

    if (forbidden) {
      return res.status(200).json({
        reply: `К сожалению, мы **не принимаем заказы** на: ${forbidden}. 
Мы работаем только с современными корпусными решениями для квартир в г. Душанбе.  
Если хотите — подскажу, какие работы мы выполняем и помогу рассчитать стоимость.`,
      });
    }

    // === РАСЧЁТ ЦЕНЫ ===

    function calculatePrice(length, tariff) {
      if (length < MIN_LENGTH) {
        return `Минимальный заказ — от ${MIN_LENGTH} погонных метров.`;
      }

      const pricePerMeter = tariff === "премиум" ? PRICES.premium : PRICES.standard;
      const sum = length * pricePerMeter;

      return `Стоимость по тарифу "${tariff === "премиум" ? "Премиум" : "Стандарт"}":

• Длина: ${length} м  
• Цена за метр: ${pricePerMeter} сом  
—————————————  
Итого: **${sum} сомони**  

Это предварительная стоимость без учёта дополнительных опций.  
При необходимости могу подсказать оптимальный стиль, материалы или помочь собрать полноценный бриф.`;
    }

    // === ПАРСИНГ ЧИСЕЛ И ТАРИФОВ ===
    const lengthMatch = lastUserMessage.match(/([0-9]+([.,][0-9]+)?)\s*м/);
    const length = lengthMatch ? parseFloat(lengthMatch[1].replace(",", ".")) : null;

    let tariff = null;
    if (/премиум/i.test(lastUserMessage)) tariff = "премиум";
    if (/стандарт/i.test(lastUserMessage)) tariff = "стандарт";

    // Если пользователь явно спрашивает цену погонного метра
    if (/сколько.*метр/i.test(lastUserMessage) || /цена.*метр/i.test(lastUserMessage)) {
      return res.status(200).json({
        reply: `Стоимость одного погонного метра:

• Стандарт — **${PRICES.standard} сом**  
• Премиум — **${PRICES.premium} сом**

Минимальный заказ — от ${MIN_LENGTH} погонных метров.  

Хотите сразу рассчитать стоимость? Напишите длину мебели и тариф.`,
      });
    }

    // Если есть длина и тариф — сделать расчёт
    if (length && tariff) {
      return res.status(200).json({
        reply: calculatePrice(length, tariff),
      });
    }

    // === ОБУЧЕННАЯ МОДЕЛЬ ДЛЯ ЛЮБЫХ ДРУГИХ ВОПРОСОВ ===

    const SYSTEM_PROMPT = `
Ты — профессиональный AI-ассистент компании Madera Design.

ТВОИ ОБЯЗАННОСТИ:
• рассчитывать стоимость мебели по нашим тарифам;
• объяснять условия работы;
• составлять бриф;
• подсказывать стиль, цвет и конфигурацию мебели;
• корректно отвечать на коммерческие вопросы;
• соблюдать ценовую политику;
• никогда не придумывать свои цены.

ЦЕНЫ:
• Стандарт — 4000 сом/м
• Премиум — 5000 сом/м
• Минимальный заказ — от 3 м
• Замер — 100 сом, оплата обязательна заранее

МЫ НЕ ПРИНИМАЕМ ЗАКАЗЫ:
${NOT_ACCEPTED.map((i) => "- " + i).join("\n")}

Если пользователь просит то, что мы НЕ выполняем — вежливо откажи.

Отвечай структурировано, коротко и профессионально.
Не используй странных фраз. Пиши простым языком.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.4,
    });

    const answer = completion.choices[0].message.content;

    return res.status(200).json({ reply: answer });
  } catch (error) {
    console.error("AI Designer API Error:", error);
    return res.status(500).json({
      error: "AI-designer: internal error",
    });
  }
}
