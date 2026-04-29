import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, Command, Mic } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { InitProgressReport } from "@mlc-ai/web-llm";
import { explainConcept } from '../services/gemini';

// --- Type definitions for Speech Recognition ---
interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;

  start: () => void;
  stop: () => void;
}
// ------------------------------------------------


interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC"; // Or any fast model

const Assistant: React.FC = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm Aura AI. How can I help you understand the election process today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Offline Engine State
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [initText, setInitText] = useState("Initializing Engine...");
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize Speech Recognition
    const win = window as any;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      recognitionRef.current = new SpeechRecognitionClass();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }


    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledPromptRef = useRef<string | null>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    let active = true;
    const initEngine = async () => {
      // Check for WebGPU support before trying local engine
      if (!('gpu' in navigator)) {
        console.log("WebGPU not supported, skipping local engine.");
        setIsInitializing(false);
        setIsEngineReady(false);
        return;
      }

      try {
        const initProgressCallback = (report: InitProgressReport) => {
          if (!active) return;
          setProgress(report.progress * 100);
          setInitText(report.text);
        };

        const mlcEngine = await CreateMLCEngine(
          SELECTED_MODEL,
          { initProgressCallback }
        );

        if (active) {
          setEngine(mlcEngine);
          setIsEngineReady(true);
          setIsInitializing(false);
        }
      } catch {
        // Silently fail to Cloud API if local init fails
        if (active) {
          setIsEngineReady(false);
          setIsInitializing(false);
        }
      }

    };

    initEngine();

    return () => {
      active = false;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = useCallback(async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isTyping || isInitializing) return;

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

    try {
      if (isOnline) {
        // Primary: Use Gemini Cloud API when online
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
      } else if (engine && isEngineReady) {
        // Fallback: Use local Gemma model only when offline
        const history = messages.map(m => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text
        }));

        history.push({ role: 'user', content: textToSend });

        const reqMessages = [
          { role: 'system' as const, content: 'You are an educational AI assistant for CivicBrain.' },
          ...history
        ];

        const chunks = await engine.chat.completions.create({
          messages: reqMessages as any, // Cast to any to satisfy the complex Union type of web-llm
          stream: true,
        });



        let fullText = "";
        for await (const chunk of chunks) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullText += content;
          setMessages(prev => prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      } else {
        // No connection and no local engine
        setMessages(prev => prev.map(msg =>
          msg.id === aiMsgId ? { ...msg, text: "I'm currently offline and my local brain isn't ready yet. Please check your internet connection!" } : msg
        ));
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Gemini Error:", error);

      setMessages(prev => prev.map(msg =>
        msg.id === aiMsgId ? { ...msg, text: "I'm having trouble connecting to my brain right now. Please try again in a moment!" } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, isInitializing, engine, isEngineReady, isOnline]);



  useEffect(() => {
    const prompt = location.state?.prompt;
    if (prompt && handledPromptRef.current !== prompt && !isInitializing) {
      handledPromptRef.current = prompt;
      setTimeout(() => handleSend(prompt), 0);
    }
  }, [location.state, handleSend, isInitializing]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTopicClick = (topic: string) => {
    handleSend(`Explain ${topic}`);
  };

  return (
    <div className="assistant-view aura-assistant-view">
      <div className="aura-chat-container">
        {isInitializing && (
          <div className="aura-init-screen">
            <div className="aura-spinner"></div>
            <div className="aura-welcome-box">
              <h2>Waking up Aura AI...</h2>
              <p>{initText}</p>
            </div>
            <div className="aura-progress-container">
              <style>{`.aura-progress-bar { width: ${Math.max(5, progress)}%; }`}</style>
              <div className="aura-progress-bar"></div>
            </div>
          </div>
        )}

        <header className="aura-app-header">
          <div className="header-title aura-header-title">
            <Bot size={24} className="text-gradient" />
            <span>CivicBrain Aura</span>
          </div>
          <div className="header-status-badges" style={{ display: 'flex', gap: '0.75rem' }}>
            <div className={`aura-online-status ${isOnline ? 'online' : 'offline'}`}>
              <div className="aura-status-dot"></div>
              <span>{isOnline ? 'Network: Online' : 'Network: Offline'}</span>
            </div>
            <div className={`aura-online-status ${isOnline ? 'online' : (isEngineReady ? 'online' : 'offline')}`}>
              <div className="aura-status-dot"></div>
              <span>{isOnline ? 'Active: Gemini (Cloud)' : (isEngineReady ? 'Active: Gemma (Local)' : 'Status: Cloud Only')}</span>
            </div>

          </div>

        </header>

        <div className="aura-messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`aura-message-wrapper ${msg.sender}`}>
              <div className={`aura-message ${msg.sender}`}>
                {msg.sender === 'ai' ? (
                  <div className="markdown-content">
                    {msg.text ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      <div className="aura-typing-indicator">
                        <div className="aura-typing-dot"></div>
                        <div className="aura-typing-dot"></div>
                        <div className="aura-typing-dot"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
                <div className="aura-message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length - 1]?.sender === 'user' && (
            <div className="aura-message-wrapper ai">
              <div className="aura-message ai aura-typing-message">
                <div className="aura-typing-indicator">
                  <div className="aura-typing-dot"></div>
                  <div className="aura-typing-dot"></div>
                  <div className="aura-typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="aura-input-container">
          <div className="quick-topics aura-quick-topics">
            <button className="topic-chip glass-card" onClick={() => handleTopicClick('EVM')} disabled={isInitializing}>Explain EVM</button>
            <button className="topic-chip glass-card" onClick={() => handleTopicClick('NOTA')} disabled={isInitializing}>What is NOTA?</button>
            <button className="topic-chip glass-card" onClick={() => handleTopicClick('Voter Registration')} disabled={isInitializing}>Registration Help</button>
          </div>
          <div className="aura-input-box">
            <Command size={18} className="aura-command-icon" />
            <input
              type="text"
              placeholder={isInitializing ? "Initializing Engine..." : "Ask anything about elections..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping || isInitializing}
            />
            <button
              className={`aura-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              disabled={isTyping || isInitializing}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>
            <button
              className="aura-send-btn"
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim() || isInitializing}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
