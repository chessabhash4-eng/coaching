import supabase from './db-client.js';
import { cors, getAdmin } from './_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    if (req.method === 'POST') {
      const { name, phone, email, course, message } = req.body || {};
      const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
      if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Please enter your name' });
      if (cleanPhone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Please enter a valid phone number' });
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email' });
      const { data, error } = await supabase
        .from('messages')
        .insert({
          name: String(name).trim().slice(0, 120),
          phone: cleanPhone.slice(0, 20),
          email: email ? String(email).trim().slice(0, 160) : null,
          course: course ? String(course).slice(0, 160) : null,
          message: message ? String(message).slice(0, 2000) : null,
          status: 'new',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (error) throw error;
      return res.status(201).json({ ok: true, id: data.id });
    }

    const admin = await getAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !['new', 'contacted', 'enrolled', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid update' });
      const { data, error } = await supabase.from('messages').update({ status }).eq('id', id).select('*').single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const id = (req.body && req.body.id) || req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('messages error', err);
    return res.status(500).json({ error: err.message });
  }
}
