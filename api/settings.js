import supabase from './db-client.js';
import { cors, getAdmin, pick } from './_lib.js';

const FIELDS = ['institute_name', 'tagline', 'hero_subline', 'admissions_text', 'phone', 'alt_phone', 'whatsapp', 'email', 'address', 'hours', 'map_embed_url', 'map_link', 'instagram', 'facebook', 'youtube', 'telegram'];

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (error) throw error;
      return res.status(200).json(data || {});
    }
    if (req.method === 'PUT') {
      const admin = await getAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Unauthorized' });
      const row = pick(req.body || {}, FIELDS);
      const { data, error } = await supabase.from('settings').upsert({ id: 1, ...row }).select('*').single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('settings error', err);
    return res.status(500).json({ error: err.message });
  }
}
