import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const REACTIONS = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'haha', emoji: '😂' },
  { type: 'fire', emoji: '🔥' },
  { type: 'sad', emoji: '😢' },
  { type: 'wow', emoji: '😮' }
];

export default function MessageDetail() {
  const router = useRouter();
  const { id } = router.query;
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const [message, setMessage] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/messages/${id}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      setMessage(data);
      setCounts(data.reaction_counts || {});
    } catch (err) {
      console.error('load message error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function react(type) {
    if (!id) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/messages/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.reaction_counts) setCounts(data.reaction_counts);
      else await load();
    } catch (err) {
      console.error('react error', err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Détail du message</h1>
        <nav>
          <Link href="/"><a>← Retour au feed</a></Link>
        </nav>
      </header>

      <main>
        {loading && <p>Chargement…</p>}
        {!loading && !message && <p>Message non trouvé.</p>}
        {message && (
          <div className="detail-card">
            <div className="meta">
              <strong>De :</strong> <span>{message.from_phone}</span>
              <span className="time">{new Date(message.created_at).toLocaleString()}</span>
            </div>
            <p className="body">{message.body || '(pas de texte)'}</p>
            {message.media_url && <div className="media">Media: {message.media_url}</div>}
            <div className="reactions-row">
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  className="reaction-btn"
                  onClick={() => react(r.type)}
                  disabled={posting}
                >
                  <span className="emoji">{r.emoji}</span>
                  <span className="count">{counts[r.type] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
