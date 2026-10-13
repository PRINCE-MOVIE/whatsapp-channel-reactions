import { useEffect, useState } from 'react';
import Link from 'next/link';
import MessageCard from '../components/MessageCard';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    let mounted = true;
    async function fetchMessages() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/messages`);
        const data = await res.json();
        if (mounted) setMessages(data);
      } catch (err) {
        console.error('fetch messages error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchMessages();
    const iv = setInterval(fetchMessages, 5000); // refresh every 5s
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Feed — Messages WhatsApp</h1>
        <p>Les messages reçus via webhook et les réactions (stockées sur le site).</p>
      </header>

      <main>
        {loading && <p>Chargement…</p>}
        {!loading && messages.length === 0 && <p>Aucun message pour le moment.</p>}
        <div className="list">
          {messages.map(m => (
            <Link key={m.id} href={`/messages/${m.id}`}>
              <a><MessageCard message={m} /></a>
            </Link>
          ))}
        </div>
      </main>

      <footer>
        <small>Frontend connecté à {API}</small>
      </footer>
    </div>
  );
}
