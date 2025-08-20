import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Bot, 
  Loader, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown,
  Sparkles,
  BarChart2,
  BrainCircuit
} from 'lucide-react';
import { generateGeminiResponse, getSuggestedQueries } from '../GeminiService';
import './EnhancedFloatingAIChat.css';

const EnhancedFloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: "Hello! I'm BIP, your Branch Intelligence Assistant. How can I help you analyze branch performance today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState(getSuggestedQueries());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuery = (query) => {
    setInputValue(query);
    // Auto-submit after a short delay
    setTimeout(() => {
      sendMessage();
    }, 200);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(messages => [...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-6); // Last 6 messages for context
      
      const response = await generateGeminiResponse(userMessage.text, conversationHistory);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.text,
        data: response.data,
        timestamp: new Date()
      };

      setMessages(messages => [...messages, botMessage]);
      
      // Generate new suggested queries after the conversation progresses
      if (messages.length > 4) {
        setSuggestedQueries(getSuggestedQueries());
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date()
      };

      setMessages(messages => [...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const renderMessageContent = (message) => {
    if (message.data) {
      return (
        <>
          <p>{message.text}</p>
          <div className="ai-chat-data">
            {message.data.map((item, idx) => (
              <div key={idx} className="ai-chat-data-item">
                {/* Branch or City Name */}
                {item.name && <h4>{item.name}</h4>}
                {item.city && <h4>{item.city}</h4>}
                
                {/* Score */}
                {item.score !== undefined && (
                  <div className="ai-chat-metric">
                    <span className="metric-label">BHS:</span>
                    <span className="metric-value">{item.score}%</span>
                  </div>
                )}
                
                {/* Wait Time */}
                {item.waitTime !== undefined && (
                  <div className="ai-chat-metric">
                    <span className="metric-label">Wait Time:</span>
                    <span className="metric-value">{item.waitTime} min</span>
                  </div>
                )}
                
                {/* Average Score */}
                {item.avgScore !== undefined && (
                  <div className="ai-chat-metric">
                    <span className="metric-label">Avg BHS:</span>
                    <span className="metric-value">{item.avgScore}%</span>
                  </div>
                )}
                
                {/* Branch Count */}
                {item.branches !== undefined && (
                  <div className="ai-chat-metric">
                    <span className="metric-label">Branches:</span>
                    <span className="metric-value">{item.branches}</span>
                  </div>
                )}
                
                {/* Insight */}
                {item.insight && (
                  <div className="ai-chat-insight">{item.insight}</div>
                )}
              </div>
            ))}
          </div>
          <div className="ai-chat-feedback">
            <button className="feedback-btn" title="Helpful">
              <ThumbsUp size={14} />
            </button>
            <button className="feedback-btn" title="Not Helpful">
              <ThumbsDown size={14} />
            </button>
          </div>
        </>
      );
    } else {
      return <p>{message.text}</p>;
    }
  };

  return (
    <div className="floating-ai-chat enhanced">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="bipchat-window"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bipchat-header">
              <div className="header-left">
                <div className="bipchat-logo">
                  <Bot size={20} />
                </div>
                <div className="bipchat-title">
                  <h3>BIP Chat</h3>
                  <div className="bipchat-subtitle">
                    <Sparkles size={12} />
                    <span>AI-Powered Branch Intelligence</span>
                  </div>
                </div>
              </div>
              <button className="close-chat-btn" onClick={toggleChat}>
                <X size={16} />
              </button>
            </div>
            
            <div className="bipchat-tools">
              <div className="tool-button">
                <BrainCircuit size={14} />
                <span>AI Insights</span>
              </div>
              <div className="tool-button">
                <BarChart2 size={14} />
                <span>Analytics</span>
              </div>
            </div>
            
            <div className="bipchat-messages">
              <div className="date-divider">
                <span>Today</span>
              </div>
              
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`bipchat-message ${message.type === 'bot' ? 'bot-message' : 'user-message'}`}
                >
                  <div className="message-content">
                    {renderMessageContent(message)}
                  </div>
                  <div className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="bipchat-message bot-message">
                  <div className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="suggested-queries">
              {suggestedQueries.map((query, index) => (
                <button 
                  key={index} 
                  className="suggested-query" 
                  onClick={() => handleSuggestedQuery(query)}
                >
                  {query}
                </button>
              ))}
            </div>
            
            <div className="bipchat-input-container">
              <input
                ref={inputRef}
                type="text"
                className="bipchat-input"
                placeholder="Ask about branch performance..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button 
                className="bipchat-send-btn"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="bipchat-toggle"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img src="/chatbot.png" alt="BIP Chat" className={`bipchat-toggle-icon ${isOpen ? 'active' : ''}`} />
      </motion.button>
    </div>
  );
};

export default EnhancedFloatingAIChat;
