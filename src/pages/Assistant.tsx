import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Command } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { explainConcept } from '../services/gemini';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Assistant: React.FC = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm CivicBrain Assistant. How can I help you understand the election process today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handledPromptRef = React.useRef<string | null>(null);

  const handleSend = React.useCallback(async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now() + Math.random(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const aiMsgId = Date.now() + Math.random();
    const initialAiMsg: Message = {
      id: aiMsgId,
      text: "",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, initialAiMsg]);

    // Fetch streaming response from AI Service
    try {
      let fullText = "";
      await explainConcept({ 
        topic: textToSend, 
        level: 'beginner',
        onStream: (chunk) => {
          fullText += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      });
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, text: "I'm having trouble connecting to my brain right now. Please try again in a moment!" } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  useEffect(() => {
    const prompt = location.state?.prompt;
    if (prompt && handledPromptRef.current !== prompt) {
      handledPromptRef.current = prompt;
      setTimeout(() => handleSend(prompt), 0);
    }
  }, [location.state, handleSend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTopicClick = (topic: string) => {
    handleSend(`Explain ${topic}`);
  };

  return (
    <div className="assistant-view">
      <div className="chat-container glass-card">
        <header className="chat-header">
          <div className="ai-status">
            <div className={`status-dot ${isTyping ? 'pulse' : ''}`}></div>
            <Bot size={20} className="text-gradient" />
            <span>CivicBrain AI</span>
          </div>
          <div className="engine-badge">
            <Sparkles size={14} />
            <span>Gemini 1.5 Flash</span>
          </div>
        </header>

        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-avatar glass-card">
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="message-bubble glass-card">
                {msg.sender === 'ai' ? (
                  <div className="markdown-content">
                    {msg.text ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      <div className="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
                <span className="timestamp">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="quick-topics">
            <button className="topic-chip glass-card" onClick={() => handleTopicClick('EVM')}>Explain EVM</button>
            <button className="topic-chip glass-card" onClick={() => handleTopicClick('NOTA')}>What is NOTA?</button>
            <button className="topic-chip glass-card" onClick={() => handleTopicClick('Voter Registration')}>Registration Help</button>
          </div>
          <div className="input-wrapper glass-card">
            <Command size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Ask anything about elections..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={isTyping || !input.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
