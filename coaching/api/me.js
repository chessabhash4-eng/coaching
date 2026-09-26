import { cors, getUser, getAdmin } from './_lib.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const admin = await getAdmin(req);
    return res.status(200).json({ email: user.email, isAdmin: !!admin });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
