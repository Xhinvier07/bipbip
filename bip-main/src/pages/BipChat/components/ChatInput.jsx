import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Paperclip, Image } from 'lucide-react';

const ChatInput = ({ value, onChange, onSubmit }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };
  
  return (
    <form id="chat-form" className="chat-input-container" onSubmit={onSubmit}>
      <div className="chat-input-tools">
        <button type="button" className="input-tool-button">
          <Paperclip size={18} />
        </button>
        <button type="button" className="input-tool-button">
          <Image size={18} />
        </button>
        <button type="button" className="input-tool-button voice-button">
          <Mic size={18} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="chat-input"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask BIP about branch analytics, metrics, or insights..."
        rows={1}
      />
      <motion.button
        type="submit"
        className="send-button"
        disabled={!value.trim()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: value.trim() ? 1 : 0.6 }}
      >
        <Send size={18} />
      </motion.button>
    </form>
  );
};

export default ChatInput;