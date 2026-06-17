export default function MessageBubble({ role, content }) {
  const isAI = role === 'assistant';
  return (
    <div className={`bubble-row ${isAI ? 'bubble-row-ai' : 'bubble-row-user'}`}>
      <div className={`bubble ${isAI ? 'bubble-ai' : 'bubble-user'}`}>
        {isAI && <span className="bubble-icon">🤖</span>}
        <span>{content}</span>
      </div>
    </div>
  );
}
