// api/partner.js
// Серверная функция Vercel для обработки заявок партнёрской программы

export default async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, phone, profession, profileLink, audience } = req.body || {};

    // Проверяем обязательные поля
    if (!name || !phone) {
      return res
        .status(400)
        .json({ error: "Поле 'name' и 'phone' обязательны." });
    }

    // Здесь ты можешь делать всё, что угодно:
    // - писать в Google Sheets
    // - отправлять в Telegram
    // - слать письмо себе на почту
    // Сейчас просто логируем в консоль Vercel (видно в логах деплоя)
    console.log("Новая заявка партнёра:", {
      name,
      phone,
      profession,
      profileLink,
      audience,
    });

    // Возвращаем успешный ответ фронтенду
    return res.status(200).json({ ok: true, message: "Заявка принята." });
  } catch (error) {
    console.error("Ошибка в обработчике /api/partner:", error);
    return res.status(500).json({
      error: "Внутренняя ошибка сервера. Попробуйте позже.",
    });
  }
}
