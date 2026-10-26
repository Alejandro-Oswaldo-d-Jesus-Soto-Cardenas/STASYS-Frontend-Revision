import { Bot, UserRound } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const Icon = isUser ? UserRound : Bot;

  return (
    <article className={`assistant-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}>
      <span className="assistant-message-avatar" aria-hidden="true">
        <Icon size={17} />
      </span>
      <div className="assistant-message-body">
        <div className="assistant-message-meta">
          <strong>{isUser ? 'Tú' : 'Soto'}</strong>
        </div>
        <p>{message.content}</p>
      </div>
    </article>
  );
}
