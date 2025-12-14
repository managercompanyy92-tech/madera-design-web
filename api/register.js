import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, name, password } = req.body || {};
    const p = String(phone || '').trim();
    const n = String(name || '').trim();
    const pass = String(password || '');

    if (!p || !n || pass.length < 4) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(url, serviceKey);

    const password_hash = await bcrypt.hash(pass, 10);

    const { data, error } = await supabase
      .from('app_users')
      .insert([{ phone: p, name: n, password_hash }])
      .select('id, phone, name')
      .single();

    if (error) {
      // уникальность телефона
      if (String(error.message).toLowerCase().includes('duplicate')) {
        return res.status(409).json({ error: 'User already exists' });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ ok: true, user: data });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
