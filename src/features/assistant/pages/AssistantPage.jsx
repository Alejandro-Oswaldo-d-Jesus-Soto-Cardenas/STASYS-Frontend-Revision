import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, MessageCircle, Sparkles, X } from 'lucide-react';
import { processAssistantQuestion } from '../api/assistantApi.js';
import ChatInput from '../components/ChatInput.jsx';
import ChatMessage from '../components/ChatMessage.jsx';

const suggestedQuestions = [
  '¿Cuántos casos críticos hay registrados?',
  '¿Qué alertas y niveles de riesgo muestra el dashboard?',
  '¿Qué información de IPRESS aparece en los casos de ejemplo?',
  '¿Cómo puedo revisar el seguimiento de los casos pendientes?',
];

export default function AssistantPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const processingLock = useRef(false);
  const conversationEnd = useRef(null);

  useEffect(() => {
    conversationEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  async function sendQuestion(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || processingLock.current) return;

    processingLock.current = true;
    const currentRequest = ++requestId.current;
    setError('');
    setMessages((current) => [
      ...current,
      { id: `${currentRequest}-user`, role: 'user', content: cleanQuestion },
    ]);
    setIsProcessing(true);

    try {
      const response = await processAssistantQuestion(cleanQuestion);
      if (currentRequest !== requestId.current) return;
      setMessages((current) => [
        ...current,
        {
          id: `${currentRequest}-assistant`,
          role: 'assistant',
          content: response.content,
          simulated: response.simulated,
        },
      ]);
    } catch (processingError) {
      if (currentRequest !== requestId.current) return;
      setError(processingError instanceof Error ? processingError.message : 'No se pudo procesar la pregunta. Inténtalo nuevamente.');
    } finally {
      if (currentRequest === requestId.current) {
        processingLock.current = false;
        setIsProcessing(false);
      }
    }
  }

  return (
    <div className="assistant-widget">
      {isOpen && (
        <section className="assistant-widget-panel" role="dialog" aria-label="Soto, asistente de STASYS">
          <div className="assistant-chat-card">
            <div className="assistant-chat-topline">
              <span className="assistant-chat-status-icon"><Bot size={18} /></span>
              <div>
                <strong>Soto · STASYS</strong>
                <small><span className="assistant-status-dot" /> Asistente de supervisión sanitaria</small>
              </div>
              <button
                className="assistant-close-button"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar asistente"
              >
                <X size={18} />
              </button>
            </div>

            <div className="assistant-notice" role="note">
              <Sparkles size={16} />
              <p><strong>Modo demostración.</strong> Respuestas simuladas con datos de ejemplo; no consulta una IA ni datos en tiempo real.</p>
            </div>

            <div className="assistant-conversation" aria-live="polite" aria-busy={isProcessing}>
              {messages.length === 0 ? (
                <div className="assistant-welcome">
                  <span className="assistant-welcome-icon"><MessageCircle size={23} /></span>
                  <h2>¿En qué puedo ayudarte?</h2>
                  <p>Elige una consulta sobre supervisión sanitaria, casos o indicadores.</p>
                  <div className="assistant-suggestions">
                    {suggestedQuestions.map((question) => (
                      <button key={question} type="button" onClick={() => sendQuestion(question)} disabled={isProcessing}>
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="assistant-message-list">
                  {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
                  {isProcessing && (
                    <div className="assistant-processing" role="status">
                      <span className="assistant-processing-dots" aria-hidden="true"><i /><i /><i /></span>
                      <span>Preparando respuesta simulada...</span>
                    </div>
                  )}
                  {!isProcessing && !error && messages.at(-1)?.role === 'assistant' && (
                    <div className="assistant-follow-up">
                      <p>Por ahora puedo ayudarte con estos temas:</p>
                      <div className="assistant-suggestions">
                        {suggestedQuestions.map((question) => (
                          <button key={question} type="button" onClick={() => sendQuestion(question)}>
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={conversationEnd} />
                </div>
              )}
              {error && (
                <div className="assistant-error" role="alert">
                  <AlertCircle size={17} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <ChatInput onSend={sendQuestion} isProcessing={isProcessing} />
          </div>
        </section>
      )}

      <button
        className={`assistant-launcher ${isOpen ? 'assistant-launcher-open' : ''}`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Cerrar Soto, asistente de STASYS' : 'Abrir Soto, asistente de STASYS'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={23} /> : <Bot size={25} />}
        {!isOpen && <span className="assistant-launcher-label">Soto · STASYS</span>}
      </button>
    </div>
  );
}
