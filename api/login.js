import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, password } = req.body || {};
    const p = String(phone || '').trim();
    const pass = String(password || '');

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const secret = process.env.JWT_SECRET;

    if (!p || !pass) return res.status(400).json({ error: 'Invalid input' });
    if (!secret) return res.status(500).json({ error: 'Missing JWT_SECRET' });

    const supabase = createClient(url, serviceKey);

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, phone, name, password_hash')
      .eq('phone', p)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!user) return res.status(404).json({ error: 'Account not found' });

    const ok = await bcrypt.compare(pass, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ uid: user.id }, secret, { expiresIn: '30d' });

    res.setHeader('Set-Cookie', cookie.serialize('md_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    }));

    return res.status(200).json({ ok: true, user: { id: user.id, phone: user.phone, name: user.name } });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
