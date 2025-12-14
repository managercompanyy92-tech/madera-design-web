import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return res.status(500).json({ ok: false, error: 'Missing SUPABASE env vars' });
    }

    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase
      .from('app_users')
      .select('id')
      .limit(1);

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, rows: data?.length ?? 0 });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
