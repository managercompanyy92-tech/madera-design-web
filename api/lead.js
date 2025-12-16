export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const lead = req.body;

    // TODO: сохранить / отправить в CRM / Google Sheets и т.д.
    return res.status(200).json({ success: true, received: lead });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
}
