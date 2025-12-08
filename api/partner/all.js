// api/partner/all.js
import pkg from "pg";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  // Подключение к твоей базе Render PostgreSQL
  const client = new pkg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const query = `
      SELECT id, name, phone, activity, profile_link, audience, created_at
      FROM partner_requests
      ORDER BY id DESC;
    `;

    const result = await client.query(query);

    return res.status(200).json({
      ok: true,
      total: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  } finally {
    await client.end();
  }
}
