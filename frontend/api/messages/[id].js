// Handles GET /api/messages/[id] and POST for adding a reaction
const db = require('../../../lib/db');

export default async function handler(req, res) {
  await db.init();
  const { id } = req.query;
  const messageId = Number(id);

  if (req.method === 'GET') {
    try {
      const mres = await db.query(`SELECT * FROM messages WHERE id = $1`, [messageId]);
      if (mres.rowCount === 0) return res.status(404).json({ error: 'Message not found' });
      const msg = mres.rows[0];
      const rc = await db.query(`SELECT type, COUNT(*)::int as count FROM reactions WHERE message_id = $1 GROUP BY type`, [messageId]);
      const counts = {};
      rc.rows.forEach(r => counts[r.type] = r.count);
      return res.json({ ...msg, reaction_counts: counts });
    } catch (err) {
      console.error('message get error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  }

  if (req.method === 'POST') {
    const { type, user_id } = req.body || {};
    if (!type) return res.status(400).json({ error: 'type required' });
    const allowed = ['like','love','haha','fire','sad','wow'];
    if (!allowed.includes(type)) return res.status(400).json({ error: 'type invalid' });

    try {
      const mres = await db.query(`SELECT id FROM messages WHERE id = $1`, [messageId]);
      if (mres.rowCount === 0) return res.status(404).json({ error: 'Message not found' });

      await db.query(`INSERT INTO reactions (message_id, type, user_id) VALUES ($1,$2,$3)`, [messageId, type, user_id || 'anonymous']);
      const rc = await db.query(`SELECT type, COUNT(*)::int as count FROM reactions WHERE message_id = $1 GROUP BY type`, [messageId]);
      const counts = {};
      rc.rows.forEach(r => counts[r.type] = r.count);
      return res.json({ ok:true, reaction_counts: counts });
    } catch (err) {
      console.error('add reaction error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  }

  res.setHeader('Allow','GET,POST');
  res.status(405).end('Method Not Allowed');
}
