import supabase from './db-client.js';
import { cors, getAdmin, pick } from './_lib.js';

const RESOURCES = {
  courses: ['title', 'category', 'class_level', 'description', 'duration', 'subjects', 'fee', 'online_classes', 'study_material', 'doubt_support', 'highlights', 'badge', 'sort_order'],
  features: ['title', 'description', 'icon', 'note', 'sort_order'],
  stats: ['label', 'value', 'suffix', 'description', 'sort_order'],
  results: ['student_name', 'exam', 'score', 'percentage', 'year', 'highlight', 'photo_url', 'sort_order'],
  faculty: ['name', 'subject', 'experience', 'qualification', 'bio', 'photo_url', 'sort_order'],
  testimonials: ['student_name', 'course', 'message', 'rating', 'year', 'sort_order'],
  admins: ['email'],
};

export default async function handler(req, res) {
  if (cors(req, res)) return;
  const resource = String(req.query.resource || '');
  const fields = RESOURCES[resource];
  if (!fields) return res.status(400).json({ error: 'Unknown resource' });

  try {
    if (req.method === 'GET') {
      if (resource === 'admins') {
        const admin = await getAdmin(req);
        if (!admin) return res.status(401).json({ error: 'Unauthorized' });
      }
      let q = supabase.from(resource).select('*');
      if (resource !== 'admins') q = q.order('sort_order', { ascending: true });
      const { data, error } = await q.order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    const admin = await getAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized — admin access required' });

    if (req.method === 'POST') {
      const row = pick(req.body || {}, fields);
      if (resource === 'admins') {
        row.email = String(row.email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return res.status(400).json({ error: 'Valid email required' });
      }
      const { data, error } = await supabase.from(resource).insert(row).select('*').single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const row = pick(req.body, fields);
      const { data, error } = await supabase.from(resource).update(row).eq('id', id).select('*').single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const id = (req.body && req.body.id) || req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      if (resource === 'admins') {
        const { count } = await supabase.from('admins').select('id', { count: 'exact', head: true });
        if ((count || 0) <= 1) return res.status(400).json({ error: 'At least one admin must remain' });
      }
      const { error } = await supabase.from(resource).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('content error', err);
    return res.status(500).json({ error: err.message });
  }
}
