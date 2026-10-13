require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Initialize schema (idempotent)
db.exec(`
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone_number TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  whatsapp_message_id TEXT UNIQUE,
  from_phone TEXT NOT NULL,
  body TEXT,
  media_url TEXT,
  channel_id TEXT DEFAULT 'default',
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  user_id TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
);
`);

// Prepared statements
const insertMessageStmt = db.prepare(`
  INSERT OR IGNORE INTO messages (whatsapp_message_id, from_phone, body, media_url, channel_id)
  VALUES (@whatsapp_message_id, @from_phone, @body, @media_url, @channel_id)
`);
const getMessagesStmt = db.prepare(`SELECT * FROM messages ORDER BY created_at DESC`);
const getMessageByIdStmt = db.prepare(`SELECT * FROM messages WHERE id = ?`);
const getMessageByWhatsAppIdStmt = db.prepare(`SELECT * FROM messages WHERE whatsapp_message_id = ?`);

const insertReactionStmt = db.prepare(`
  INSERT INTO reactions (message_id, type, user_id) VALUES (?, ?, ?)
`);
const getReactionsByMessageStmt = db.prepare(`
  SELECT type, COUNT(*) as count FROM reactions WHERE message_id = ? GROUP BY type
`);
const listReactionsStmt = db.prepare(`
  SELECT id, message_id, type, user_id, created_at FROM reactions WHERE message_id = ? ORDER BY created_at DESC
`);

module.exports = {
  createMessage: (msg) => {
    insertMessageStmt.run({
      whatsapp_message_id: msg.whatsapp_message_id,
      from_phone: msg.from_phone,
      body: msg.body,
      media_url: msg.media_url || null,
      channel_id: msg.channel_id || 'default'
    });
    return getMessageByWhatsAppIdStmt.get(msg.whatsapp_message_id);
  },
  getMessages: () => getMessagesStmt.all(),
  getMessageById: (id) => getMessageByIdStmt.get(id),
  addReaction: (messageId, type, userId) => {
    const info = insertReactionStmt.run(messageId, type, userId || null);
    return info.changes === 1;
  },
  getReactionCounts: (messageId) => getReactionsByMessageStmt.all(messageId),
  listReactions: (messageId) => listReactionsStmt.all(messageId)
};
