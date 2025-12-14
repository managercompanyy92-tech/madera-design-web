import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    const secret = process.env.JWT_SECRET;
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.md_session;

    if (!token) return res.status(200).json({ ok: true, user: null });
    if (!secret) return res.status(500).json({ ok: false, error: 'Missing JWT_SECRET' });

    const payload = jwt.verify(token, secret);
    const supabase = createClient(url, serviceKey);

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, phone, name, created_at')
      .eq('id', payload.uid)
      .maybeSingle();

    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, user: user || null });
  } catch (e) {
    // если токен битый — считаем как logout
    return res.status(200).json({ ok: true, user: null });
  }
}
