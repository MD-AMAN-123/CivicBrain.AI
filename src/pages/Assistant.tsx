import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Command } from 'lucide-react';
import { explainConcept } from '../services/gemini';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm CivicBrain Assistant. How can I help you understand the election process today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Fetch response from AI Service
    try {
      const response = await explainConcept({ topic: userMsg.text, level: 'beginner' });
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (_error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "I'm having some trouble right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="assistant-view">
      <div className="chat-container glass-card">
        <header className="chat-header">
          <div className="ai-status">
            <div className="status-dot"></div>
            <Bot size={20} className="text-gradient" />
            <span>CivicBrain AI</span>
          </div>
          <div className="engine-badge">
            <Sparkles size={14} />
            <span>Gemini Pro</span>
          </div>
        </header>

        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-avatar glass-card">
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="message-bubble glass-card">
                <p>{msg.text}</p>
                <span className="timestamp">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="input-area">
          <div className="quick-topics">
            <button className="topic-chip glass-card">Explain EVM</button>
            <button className="topic-chip glass-card">What is NOTA?</button>
            <button className="topic-chip glass-card">Registration Help</button>
          </div>
          <div className="input-wrapper glass-card">
            <Command size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="Ask anything about elections..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .assistant-view {
          height: calc(100vh - 8rem);
          display: flex;
          justify-content: center;
        }

        .chat-container {
          width: 100%;
          max-width: 1000px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }

        .engine-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
        }

        .messages-list {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .message-wrapper {
          display: flex;
          gap: 1rem;
          max-width: 80%;
        }

        .message-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .message-bubble {
          padding: 1rem 1.25rem;
          position: relative;
        }

        .user .message-bubble {
          background: var(--primary);
          border-color: transparent;
        }

        .message-bubble p {
          line-height: 1.5;
        }

        .timestamp {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.7rem;
          opacity: 0.5;
        }

        .input-area {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .quick-topics {
          display: flex;
          gap: 0.75rem;
        }

        .topic-chip {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          cursor: pointer;
          border-radius: 2rem;
        }

        .topic-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          gap: 1rem;
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 0.8rem 0;
          outline: none;
        }

        .send-btn {
          background: var(--primary);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .send-btn:hover {
          transform: scale(1.05);
          background: var(--secondary);
        }

        .input-icon {
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .message-wrapper {
            max-width: 95%;
          }
          
          .chat-container {
            height: 100%;
          }

          .quick-topics {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .topic-chip {
            white-space: nowrap;
          }

          .assistant-view {
            height: calc(100vh - 120px);
          }
        }
      ` }} />
    </div>
  );
};

export default Assistant;
