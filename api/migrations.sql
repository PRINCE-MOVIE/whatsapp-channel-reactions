# Tables: messages, reactions, channels
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
