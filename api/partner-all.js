// api/partner-all.js
// Serverless-функция Node.js для Vercel (CommonJS)

const { Client } = require("pg");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "Use GET /api/partner-all"
    });
  }

  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      return res.status(500).json({
        ok: false,
        error:
          "DATABASE_URL not found. Add DATABASE_URL in Vercel → Settings → Environment Variables."
      });
    }

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const result = await client.query(`
      SELECT 
        id, 
        name, 
        phone, 
        activity, 
        profile_link, 
        audience, 
        created_at
      FROM partner_requests
      ORDER BY id DESC;
    `);

    await client.end();

    res.status(200).json({
      ok: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
};
