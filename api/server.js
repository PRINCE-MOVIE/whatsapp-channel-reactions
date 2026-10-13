require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('cross-fetch');
const db = require('./db');

const PORT = Number(process.env.PORT || 3000);
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'verify_token_example';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || null;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || null;

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'whatsapp-channel-reactions-api' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  res.sendStatus(400);
});

app.post('/webhook', async (req, res) => {
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

          if (msg.type === 'text' && msg.text && msg.text.body) {
            db.createMessage({
              whatsapp_message_id: id,
              from_phone: from,
              body: msg.text.body,
              channel_id: value.metadata?.phone_number_id || 'default'
            });
          } else if (msg.type === 'image' && msg.image) {
            db.createMessage({
              whatsapp_message_id: id,
              from_phone: from,
              body: msg.caption || null,
              media_url: msg.image.id,
              channel_id: value.metadata?.phone_number_id || 'default'
            });
          } else {
            db.createMessage({
              whatsapp_message_id: id,
              from_phone: from,
              body: JSON.stringify(msg).slice(0, 1000),
              channel_id: value.metadata?.phone_number_id || 'default'
            });
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/messages', (req, res) => {
  const messages = db.getMessages();
  const result = messages.map((m) => {
    const reactions = db.getReactionCounts(m.id);
    const counts = {};
    reactions.forEach((r) => {
      counts[r.type] = r.count;
    });
    return { ...m, reaction_counts: counts };
  });
  res.json(result);
});

app.get('/messages/:id', (req, res) => {
  const msg = db.getMessageById(Number(req.params.id));
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const reactions = db.getReactionCounts(msg.id);
  const counts = {};
  reactions.forEach((r) => {
    counts[r.type] = r.count;
  });

  res.json({ ...msg, reaction_counts: counts });
});

app.post('/messages/:id/reactions', (req, res) => {
  const messageId = Number(req.params.id);
  const { type, user_id } = req.body || {};

  if (!type) {
    return res.status(400).json({ error: 'type required' });
  }

  const allowed = ['like', 'love', 'haha', 'fire', 'sad', 'wow'];
  if (!allowed.includes(type)) {
    return res.status(400).json({ error: 'type invalid' });
  }

  const msg = db.getMessageById(messageId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const ok = db.addReaction(messageId, type, user_id || 'anonymous');
  if (!ok) return res.status(500).json({ error: 'Could not add reaction' });

  const reactions = db.getReactionCounts(messageId);
  const counts = {};
  reactions.forEach((r) => {
    counts[r.type] = r.count;
  });

  res.json({ ok: true, reaction_counts: counts });
});

app.get('/messages/:id/reactions', (req, res) => {
  const messageId = Number(req.params.id);
  const msg = db.getMessageById(messageId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  res.json(db.listReactions(messageId));
});

app.post('/messages/:id/send-summary', async (req, res) => {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    return res.status(400).json({
      error: 'WHATSAPP_TOKEN and PHONE_NUMBER_ID required to send summary via WhatsApp'
    });
  }

  const messageId = Number(req.params.id);
  const msg = db.getMessageById(messageId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const reactions = db.getReactionCounts(messageId);
  const counts = {};
  reactions.forEach((r) => {
    counts[r.type] = r.count;
  });

  const summary = Object.entries(counts)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ') || 'No reactions yet';

  const payload = {
    messaging_product: 'whatsapp',
    to: msg.from_phone,
    type: 'text',
    text: {
      body: `Résumé des réactions pour votre message:\n${summary}`
    }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.json({ ok: true, raw: data });
  } catch (err) {
    console.error('send-summary error', err);
    return res.status(500).json({ error: 'failed to send summary' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Verify token configured: ${VERIFY_TOKEN}`);
});
