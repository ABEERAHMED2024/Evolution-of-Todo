import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send request to the AI agent
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL || 'http://localhost:8001'}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversation_history: messages.map(msg => ({
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
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        text: 'Sorry, I encountered an error processing your request. Please try again.', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Evolution of Todo - AI Assistant</title>
        <meta name="description" content="AI-powered task management assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <div className="header">
          <Link href="/" className="back-link">
            ← Back to Tasks
          </Link>
          <h1 className="title">AI Task Assistant</h1>
        </div>
        
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>Hello! I'm your AI task assistant. You can ask me to:</p>
                <ul>
                  <li>Create tasks ("Add a high-priority work task for tomorrow")</li>
                  <li>View tasks ("Show me all incomplete home tasks")</li>
                  <li>Update tasks ("Mark grocery shopping as complete")</li>
                  <li>Delete tasks ("Remove the meeting task")</li>
                  <li>Search with filters ("Find all high priority tasks")</li>
                  <li>And much more!</li>
                </ul>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-content">
                    {message.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message ai-message">
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
              Send
            </button>
          </form>
        </div>
      </main>

      <footer className="footer">
        <p>Evolution of Todo - Phase III AI Assistant</p>
      </footer>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          line-height: 1.6;
          font-size: 18px;
          background-color: #f5f5f5;
        }

        * {
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .main {
          padding: 1rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        .header {
          width: 100%;
          text-align: center;
          margin-bottom: 1rem;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 0.5rem;
          color: #0070f3;
          text-decoration: none;
          font-weight: bold;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .title {
          margin: 0 0 1rem 0;
          line-height: 1.15;
          font-size: 2rem;
          text-align: center;
        }

        .chat-container {
          width: 100%;
          max-width: 800px;
          height: 65vh;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .welcome-message {
          padding: 1rem;
          text-align: center;
          color: #666;
        }

        .welcome-message ul {
          text-align: left;
          max-width: 500px;
          margin: 1rem auto;
          padding-left: 1.5rem;
        }

        .message {
          margin-bottom: 1rem;
          max-width: 80%;
          word-wrap: break-word;
        }

        .user-message {
          align-self: flex-end;
          background-color: #0070f3;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 18px 18px 4px 18px;
        }

        .ai-message {
          align-self: flex-start;
          background-color: #f0f0f0;
          padding: 0.75rem 1rem;
          border-radius: 18px 18px 18px 4px;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #888;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
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
          background-color: #f8f8f8;
          border-top: 1px solid #eee;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 24px;
          font-size: 1rem;
          outline: none;
        }

        .chat-input:focus {
          border-color: #0070f3;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
        }

        .send-button {
          margin-left: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 1rem;
        }

        .send-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .footer {
          width: 100%;
          height: 60px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}