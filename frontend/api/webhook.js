// Vercel Serverless function for webhook verification and receiving messages
const db = require('../../lib/db');

export default async function handler(req, res) {
  await db.init();

  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'verify_token_example';

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.status(403).end();
    }
    return res.status(400).end();
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body || body.object !== 'whatsapp_business_account') {
        return res.status(200).send('ignored');
      }

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const messages = value.messages || [];
          for (const msg of messages) {
            const from = msg.from;
            const id = msg.id;
            let text = null;
            let media = null;
            if (msg.type === 'text' && msg.text && msg.text.body) {
              text = msg.text.body;
            } else if (msg.type === 'image' && msg.image) {
              text = msg.caption || null;
              media = msg.image.id || null;
            } else {
              text = JSON.stringify(msg).slice(0, 1000);
            }

            // upsert message
            const insert = `INSERT INTO messages (whatsapp_message_id, from_phone, body, media_url, channel_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (whatsapp_message_id) DO NOTHING RETURNING *`;
            await db.query(insert, [id, from, text, media, value.metadata?.phone_number_id || 'default']);
          }
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('webhook error', err);
      return res.status(500).json({ error: 'internal_error' });
    }
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).end('Method Not Allowed');
}
