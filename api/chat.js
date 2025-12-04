// api/chat.js
// Серверная функция AI-ассистента Madera Design

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("CHAT_ERROR: OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "AI-сервис не настроен" });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Пустое сообщение" });
    }

    // ------------------------------
    // СИСТЕМНЫЙ ПРОМПТ
    // ------------------------------
    const SYSTEM_PROMPT = `
Ты — AI-ассистент компании Madera Design (Душанбе).
Работаешь как менеджер и консультант по корпусной мебели на заказ.

ОСНОВНАЯ ТЕМА:
- Корпусная мебель на заказ для квартир и домов:
  кухни, гардеробные, спальни, детские, прихожие, гостиные.
- Премиальный сервис, современный дизайн, точная подгонка под размеры.

СТИЛЬ КОММУНИКАЦИИ:
- Отвечаешь кратко, по делу, профессионально.
- Обращаешься к клиенту уважительно (на "Вы"/"Шумо").
- Всегда сохраняешь доброжелательный и экспертный тон.
- Не выдумываешь то, чего нет в условиях компании.

ЯЗЫК ОТВЕТА (ЕНЬШЕ 3 погонных метров;
- без дизайн-проекта:
  либо у 
