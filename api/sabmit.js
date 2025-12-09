// api/partner/submit.js
// Один универсальный обработчик:
// POST  /api/partner/submit  -> сохранить заявку
// GET   /api/partner/submit  -> получить все заявки

import pkg from "pg";

const { Client } = pkg;

// Берём строку подключения из переменной окружения Vercel
const connectionString = process.env.DATABASE_URL;

// Вспомогательная функция: подключиться к БД, убедиться что есть таблица,
// выполнить callback и корректно закрыть соединение.
async function runInDb(callback) {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // нужно для Render PostgreSQL
    },
  });

  await client.connect();

  // Если таблицы ещё нет – создадим её один раз
  await client.query(`
    CREATE TABLE IF NOT EXISTS partner_requests (
      id SERIAL PRIMARY KEY,
      name TEXT,
      phone TEXT,
      profession TEXT,
      profile_url TEXT,
      audience TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  try {
    const result = await callback(client);
    return result;
  } finally {
    await client.end();
  }
}

export default async function handler(req, res) {
  // Простая проверка, что переменная окружения задана
  if (!connectionString) {
    return res.status(500).json({
      ok: false,
      error: "На сервере не настроена переменная DATABASE_URL",
    });
  }

  // Немного CORS, чтобы форма спокойно отправляла запросы
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // preflight-запрос браузера
    return res.status(200).end();
  }

  // Разрешаем только GET и POST
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // ===== POST: СОХРАНИТЬ ЗАЯВКУ =====
    if (req.method === "POST") {
      // Vercel сам парсит JSON, но на всякий случай обрабатываем строку
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : (req.body || {});

      const {
        name,
        phone,
        profession,
        profileUrl,
        audience,
      } = body;

      // Простая валидация: имя и телефон обязательны
      if (!name || !phone) {
        return res.status(400).json({
          ok: false,
          error: "Заполните минимум имя и телефон / WhatsApp.",
        });
      }

      // Сохраняем в базе
      const newId = await runInDb(async (client) => {
        const result = await client.query(
          `
          INSERT INTO partner_requests
            (name, phone, profession, profile_url, audience)
          VALUES
            ($1,   $2,    $3,         $4,         $5)
          RETURNING id;
        `,
          [
            name,
            phone,
            profession || "",
            profileUrl || "",
            audience || "",
          ]
        );

        return result.rows[0].id;
      });

      return res.status(200).json({
        ok: true,
        requestId: newId,
        message: "Заявка на партнёрство сохранена.",
      });
    }

    // ===== GET: ПОЛУЧИТЬ ВСЕ ЗАЯВКИ =====
    if (req.method === "GET") {
      const items = await runInDb(async (client) => {
        const result = await client.query(
          `
          SELECT
            id,
            name,
            phone,
            profession,
            profile_url AS "profileUrl",
            audience,
            created_at AS "createdAt"
          FROM partner_requests
          ORDER BY created_at DESC;
        `
        );
        return result.rows;
      });

      return res.status(200).json({
        ok: true,
        items,
      });
    }
  } catch (err) {
    console.error("Partner submit API error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Internal server error",
    });
  }
}
