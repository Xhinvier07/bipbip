import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bot, 
  Copy, 
  ThumbsUp,
  ThumbsDown, 
  Check,
  BarChart2, 
  PieChart,
  LineChart,
  MapPin,
  AlertTriangle
} from 'lucide-react';

import BipVisualization from './BipVisualization';

const ChatMessage = ({ message, isLast, timestamp }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    // In a real app, this would send the feedback to the backend
  };
  
  const isVisualization = message.visualization && message.visualization.type;

  return (
    <motion.div
      className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-avatar">
        {message.role === 'user' ? (
          <div className="user-avatar">
            <User size={16} />
          </div>
        ) : (
          <div className="assistant-avatar">
            <Bot size={16} />
          </div>
        )}
      </div>
      
      <div className="message-content-wrapper">
        <div className="message-header">
          <span className="message-sender">
            {message.role === 'user' ? 'You' : 'BIP Assistant'}
          </span>
          <span className="message-time">{timestamp}</span>
        </div>
        
        <div className="message-content">
          {message.content.includes('<span') ? (
            <div dangerouslySetInnerHTML={{ __html: message.content }}></div>
          ) : (
            message.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))
          )}
          
          {message.alert && (
            <div className="message-alert">
              <AlertTriangle size={14} />
              <span>{message.alert}</span>
            </div>
          )}
          
          {isVisualization && (
            <div className="message-visualization">
              <div className="visualization-header">
                {message.visualization.type === 'barChart' && <BarChart2 size={16} />}
                {message.visualization.type === 'pieChart' && <PieChart size={16} />}
                {message.visualization.type === 'lineChart' && <LineChart size={16} />}
                {message.visualization.type === 'map' && <MapPin size={16} />}
                <span className="visualization-title">{message.visualization.title}</span>
              </div>
              
              <BipVisualization 
                type={message.visualization.type} 
                data={message.visualization.data}
                height={message.visualization.height || 250}
              />
              
              {message.visualization.caption && (
                <div className="visualization-caption">{message.visualization.caption}</div>
              )}
            </div>
          )}
        </div>
        
        {message.role === 'assistant' && isLast && (
          <div className="message-actions">
            <div className="feedback-actions">
              <button 
                className={`feedback-btn ${feedback === 'like' ? 'active' : ''}`} 
                onClick={() => handleFeedback('like')}
                title="This was helpful"
              >
                <ThumbsUp size={14} />
              </button>
              <button 
                className={`feedback-btn ${feedback === 'dislike' ? 'active' : ''}`} 
                onClick={() => handleFeedback('dislike')}
                title="This was not helpful"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
            
            <button 
              className="copy-btn" 
              onClick={handleCopy}
              title={isCopied ? 'Copied!' : 'Copy message'}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;