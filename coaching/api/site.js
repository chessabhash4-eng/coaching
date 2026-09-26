import supabase from './db-client.js';
import { cors } from './_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const order = (q) => q.order('sort_order', { ascending: true }).order('id', { ascending: true });
    const [settings, courses, features, stats, results, faculty, testimonials] = await Promise.all([
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
      order(supabase.from('courses').select('*')),
      order(supabase.from('features').select('*')),
      order(supabase.from('stats').select('*')),
      order(supabase.from('results').select('*')),
      order(supabase.from('faculty').select('*')),
      order(supabase.from('testimonials').select('*')),
    ]);
    for (const r of [settings, courses, features, stats, results, faculty, testimonials]) {
      if (r.error) throw r.error;
    }
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=120');
    return res.status(200).json({
      settings: settings.data || {},
      courses: courses.data || [],
      features: features.data || [],
      stats: stats.data || [],
      results: results.data || [],
      faculty: faculty.data || [],
      testimonials: testimonials.data || [],
    });
  } catch (err) {
    console.error('site error', err);
    return res.status(500).json({ error: err.message });
  }
}
