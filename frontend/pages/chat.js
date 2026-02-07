import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../src/layouts/MainLayout';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send request to the AI agent via our API route
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        simulated: data.simulated
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Evolution of Todo - AI Assistant">
      <div className="chat-container">
        <div className="chat-header">
          <Link href="/" className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Tasks
          </Link>
          <div className="chat-title">
            <h1>AI Task Assistant</h1>
            <p>Powered by advanced AI technology</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">
                <div className="ai-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12h8"></path>
                    <path d="M12 8h.01"></path>
                    <path d="M12 16h.01"></path>
                  </svg>
                </div>
              </div>
              <h2>Meet Your AI Productivity Assistant</h2>
              <p>You can ask me to:</p>
              <div className="capabilities-grid">
                <div className="capability-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Create tasks</span>
                </div>
                <div className="capability-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <span>Update tasks</span>
                </div>
                <div className="capability-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 6 5 6"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span>Delete tasks</span>
                </div>
                <div className="capability-card">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Search & filter</span>
                </div>
              </div>
              <p className="tip">Try saying: "Add a high-priority work task for tomorrow"</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''} ${message.simulated ? 'simulated' : ''}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="message ai-message typing-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me to manage your tasks..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .chat-container {
          width: 100%;
          max-width: 800px;
          height: 75vh;
          display: flex;
          flex-direction: column;
          background: var(--surface);
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          border: 1px solid var(--border);
          margin: 0 auto;
        }

        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .back-link {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .chat-title h1 {
          margin: 0;
          line-height: 1.2;
          font-size: 1.5rem;
          text-align: center;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .chat-title p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-align: center;
          margin: 0;
        }

        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .welcome-message {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .welcome-icon {
          margin-bottom: 1.5rem;
        }

        .ai-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .ai-avatar svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .welcome-message h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          max-width: 600px;
          margin: 1.5rem auto;
        }

        .capability-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--surface-light);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .capability-card svg {
          color: var(--primary);
        }

        .capability-card span {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .tip {
          font-style: italic;
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        .message {
          max-width: 80%;
          word-wrap: break-word;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .user-message {
          align-self: flex-end;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 1rem 1.25rem;
          border-radius: 18px 18px 4px 18px;
          position: relative;
        }

        .ai-message {
          align-self: flex-start;
          background: var(--surface-light);
          padding: 1rem 1.25rem;
          border-radius: 18px 18px 18px 4px;
          border: 1px solid var(--border);
        }
        
        .ai-message.simulated {
          border-left: 3px solid var(--warning);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid var(--danger);
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .message-text {
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .simulated .message-text::after {
          content: " (Simulated Response)";
          font-size: 0.7rem;
          color: var(--warning);
          margin-left: 0.5rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          align-self: flex-end;
        }

        .typing-message {
          opacity: 0.7;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: var(--text-muted);
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        .chat-input-form {
          display: flex;
          padding: 1rem;
          background: var(--surface-light);
          border-top: 1px solid var(--border);
        }

        .input-container {
          display: flex;
          width: 100%;
          background: var(--surface);
          border-radius: 24px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1.25rem;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
        }

        .chat-input::placeholder {
          color: var(--text-muted);
        }

        .send-button {
          margin-left: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .send-button:disabled {
          background: var(--surface);
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .chat-container {
            height: 80vh;
            border-radius: 12px;
          }

          .message {
            max-width: 90%;
          }

          .capabilities-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}