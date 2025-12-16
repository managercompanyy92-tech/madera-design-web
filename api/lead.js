export default async function handler(req, res) {
  if (req.method === 'POST') {
    const lead = req.body;

    // здесь дальше:
    // 1. сохранить
    // 2. отправить в CRM
    // 3. отправить в Google Sheets
    // 4. передать следующему AI-агенту

    res.status(200).json({ success: true });
  }
}
