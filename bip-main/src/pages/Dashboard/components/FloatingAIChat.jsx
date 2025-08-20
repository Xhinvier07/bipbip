import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, BarChart2, Loader, ThumbsUp, ThumbsDown } from 'lucide-react';
import { generateAIResponse } from '../DashboardData';

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      text: "Hello! I'm your Branch Intelligence Assistant. I can help you analyze branch performance data. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await generateAIResponse(userMessage.text);
      
      // Format the response
      let responseText = response.text;
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: responseText,
        data: response.data,
        timestamp: new Date()
      };

      setMessages(messages => [...messages, botMessage]);
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
    <div className="floating-ai-chat">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="ai-chat-header">
              <div className="ai-chat-title">
                <BarChart2 size={18} />
                <h3>BIP Assistant</h3>
              </div>
              <button className="close-chat-btn" onClick={toggleChat}>
                <X size={18} />
              </button>
            </div>
            
            <div className="ai-chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`ai-chat-message ${message.type === 'bot' ? 'bot-message' : 'user-message'}`}
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
                <div className="ai-chat-message bot-message">
                  <div className="message-content loading">
                    <Loader size={16} className="rotating" />
                    <span>Analyzing data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="ai-chat-input-container">
              <input
                ref={inputRef}
                type="text"
                className="ai-chat-input"
                placeholder="Ask about branch performance..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button 
                className="ai-chat-send-btn"
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
        className="ai-chat-toggle"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img src="/chatbot.png" alt="AI Assistant" className="ai-chat-icon" width="32" height="32" />
      </motion.button>
    </div>
  );
};

export default FloatingAIChat;