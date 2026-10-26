import { Send } from 'lucide-react';
import { useState } from 'react';

export default function ChatInput({ onSend, isProcessing }) {
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const question = value.trim();
    if (!question || isProcessing) return;
    onSend(question);
    setValue('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className="assistant-chat-form" onSubmit={handleSubmit}>
      <label className="assistant-chat-input-label" htmlFor="assistant-question">
        <span className="visually-hidden">Escribe tu pregunta</span>
        <textarea
          id="assistant-question"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta sobre STASYS..."
          rows={1}
          disabled={isProcessing}
        />
      </label>
      <button
        className="assistant-send-button"
        type="submit"
        disabled={!value.trim() || isProcessing}
        aria-label="Enviar pregunta"
      >
        <Send size={17} />
      </button>
      <small>Enter para enviar · Shift + Enter para una nueva línea</small>
    </form>
  );
}
