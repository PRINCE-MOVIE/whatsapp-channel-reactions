export default function MessageCard({ message }) {
  const counts = message.reaction_counts || {};
  const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,3);
  return (
    <div className="message-card">
      <div className="left">
        <div className="from">{message.from_phone}</div>
        <div className="time">{new Date(message.created_at).toLocaleString()}</div>
      </div>
      <div className="content">
        <div className="body">{message.body || '(pas de texte)'}</div>
        <div className="summary">
          {top.length === 0 ? <small>Aucune réaction</small> :
            top.map(([type,count]) => <span key={type} className="summary-item">{type} {count}</span>)
          }
        </div>
      </div>
    </div>
  );
}
