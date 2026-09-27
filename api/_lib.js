import supabase from './db-client.js';

export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export async function getUser(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function getAdmin(req) {
  const user = await getUser(req);
  if (!user) return null;
  const email = (user.email || '').toLowerCase();
  if (email === 'rootcareer@gmail.com' || email === 'admin@rootcareer.in') return user;
  const { data } = await supabase.from('admins').select('id').eq('email', email).maybeSingle();
  return data ? user : null;
}

export function pick(obj, fields) {
  const out = {};
  for (const f of fields) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, f)) out[f] = obj[f];
  }
  return out;
}
