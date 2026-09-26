import supabase from './db-client.js';
import { cors, getAdmin } from './_lib.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const admin = await getAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });
    const { fileName, fileBase64, contentType } = req.body || {};
    if (!fileBase64 || !contentType || !String(contentType).startsWith('image/')) {
      return res.status(400).json({ error: 'An image file is required' });
    }
    const safe = String(fileName || 'image').toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60);
    const path = `uploads/${Date.now()}-${safe}`;
    const buffer = Buffer.from(fileBase64, 'base64');
    const { error } = await supabase.storage.from('media').upload(path, buffer, { contentType, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return res.status(200).json({ url: data.publicUrl });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ error: err.message });
  }
}
