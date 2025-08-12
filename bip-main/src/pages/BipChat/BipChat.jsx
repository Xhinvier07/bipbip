import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  ChevronDown, 
  Sparkles, 
  History,
  Zap,
  X,
  Maximize2,
  Minimize2,
  BarChart2,
  MapPin,
  BrainCircuit,
  Lightbulb,
  LayoutDashboard
} from 'lucide-react';

import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import BipVisualization from './components/BipVisualization';
import { generateResponse, getSuggestedQueries, exampleVisualizationData } from './BipChatData';
import './BipChat.css';

const BipChat = () => {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm BIP, your Branch Intelligence Platform assistant. How can I help you analyze branch performance today?",
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQueries, setSuggestedQueries] = useState(getSuggestedQueries());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowWelcomeScreen(false);
    
    // Simulate typing delay
    setTimeout(() => {
      // Generate response and visualization if needed
      const { response, visualization } = generateResponse(inputValue);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        visualization: visualization,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Generate new suggested queries after the conversation has progressed
      if (messages.length > 3) {
        setSuggestedQueries(getSuggestedQueries());
      }
    }, 1500);
  };

  const handleSuggestedQuery = (query) => {
    setInputValue(query);
    // Auto-submit after a short delay
    setTimeout(() => {
      document.getElementById('chat-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 200);
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Hello! I'm BIP, your Branch Intelligence Platform assistant. How can I help you analyze branch performance today?",
      timestamp: new Date(),
    }]);
    setShowWelcomeScreen(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handleActivateTool = (tool) => {
    setActiveTool(tool === activeTool ? null : tool);
  };
  
  const formatDate = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bipchat-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="bipchat-header">
        <div className="header-left">
          <div className="bipchat-logo">
            <Bot size={24} />
          </div>
          <div className="bipchat-title">
            <h1>BIP Chat</h1>
            <div className="bipchat-subtitle">
              <Sparkles size={14} />
              <span>AI-Powered Branch Intelligence</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="header-button" onClick={clearChat}>
            <History size={18} />
          </button>
          <button className="header-button" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
      
      <div className="bipchat-tools">
        <button className={`tool-button ${activeTool === 'insights' ? 'active' : ''}`} onClick={() => handleActivateTool('insights')}>
          <BrainCircuit size={16} />
          <span>AI Insights</span>
        </button>
        <button className={`tool-button ${activeTool === 'branches' ? 'active' : ''}`} onClick={() => handleActivateTool('branches')}>
          <MapPin size={16} />
          <span>Branch Finder</span>
        </button>
        <button className={`tool-button ${activeTool === 'visualize' ? 'active' : ''}`} onClick={() => handleActivateTool('visualize')}>
          <BarChart2 size={16} />
          <span>Visualize Data</span>
        </button>
        <button className={`tool-button ${activeTool === 'dashboard' ? 'active' : ''}`} onClick={() => handleActivateTool('dashboard')}>
          <LayoutDashboard size={16} />
          <span>Quick Reports</span>
        </button>
      </div>

      <AnimatePresence>
        {activeTool && (
          <motion.div 
            className="tool-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="tool-panel-header">
              <h3>
                {activeTool === 'insights' && <><BrainCircuit size={16} /> AI Insights</>}
                {activeTool === 'branches' && <><MapPin size={16} /> Branch Finder</>}
                {activeTool === 'visualize' && <><BarChart2 size={16} /> Visualize Data</>}
                {activeTool === 'dashboard' && <><LayoutDashboard size={16} /> Quick Reports</>}
              </h3>
              <button className="close-button" onClick={() => setActiveTool(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="tool-panel-content">
              {activeTool === 'insights' && (
                <div className="insights-tool">
                  <div className="insight-card">
                    <Lightbulb size={16} />
                    <div>
                      <h4>Branch Health Insight</h4>
                      <p>Makati Ayala branch shows 15% better customer satisfaction than average. Key factors: shorter wait times, higher staff expertise.</p>
                    </div>
                  </div>
                  
                  <div className="insight-card">
                    <Zap size={16} />
                    <div>
                      <h4>Opportunity Alert</h4>
                      <p>Caloocan branch could increase efficiency by 22% with revised staffing during peak hours (12-2PM).</p>
                    </div>
                  </div>
                  
                  <div className="insight-card">
                    <BarChart2 size={16} />
                    <div>
                      <h4>Trend Detection</h4>
                      <p>Transaction volumes are increasing 5% week-over-week across all Metro Manila branches. Prepare for continued growth.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTool === 'branches' && (
                <div className="branches-tool">
                  <input type="text" placeholder="Search branches..." className="branch-search" />
                  <div className="branch-list-mini">
                    {['Makati Ayala', 'BGC High Street', 'Quezon City Cubao', 'Mandaluyong Shaw', 'Caloocan'].map(branch => (
                      <div key={branch} className="branch-item-mini">
                        <MapPin size={14} />
                        <span>{branch}</span>
                        <span className="branch-health-mini">92%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTool === 'visualize' && (
                <div className="visualize-tool">
                  <div className="viz-selection">
                    <button className="viz-option active">Branch Comparison</button>
                    <button className="viz-option">Time Series</button>
                    <button className="viz-option">Distribution</button>
                  </div>
                  
                  <div className="viz-preview">
                    <BipVisualization type="barChart" data={exampleVisualizationData.branchComparison} height={150} />
                  </div>
                  
                  <button className="viz-insert-btn">
                    <Zap size={14} />
                    Insert into chat
                  </button>
                </div>
              )}
              
              {activeTool === 'dashboard' && (
                <div className="dashboard-tool">
                  <div className="quick-reports">
                    <div className="quick-report-card">
                      <h4>Today's Overview</h4>
                      <div className="mini-stats">
                        <div className="mini-stat">
                          <span className="mini-value">1,245</span>
                          <span className="mini-label">Transactions</span>
                        </div>
                        <div className="mini-stat">
                          <span className="mini-value">8.2 min</span>
                          <span className="mini-label">Avg. Wait</span>
                        </div>
                        <div className="mini-stat">
                          <span className="mini-value">87%</span>
                          <span className="mini-label">CSAT</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="quick-report-card">
                      <h4>Weekly Comparison</h4>
                      <div className="mini-chart">
                        <BipVisualization type="lineChart" data={exampleVisualizationData.weeklyTrends} height={100} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bipchat-body" ref={chatContainerRef}>
        <AnimatePresence>
          {showWelcomeScreen && (
            <motion.div 
              className="welcome-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="welcome-header">
                <Bot size={40} />
                <h2>Welcome to BIP Chat</h2>
                <p>Your intelligent assistant for branch analytics and insights</p>
              </div>
              
              <div className="capabilities">
                <div className="capability-item">
                  <BarChart2 size={24} />
                  <h3>Data Analysis</h3>
                  <p>Ask about branch performance metrics and trends</p>
                </div>
                <div className="capability-item">
                  <BrainCircuit size={24} />
                  <h3>AI Insights</h3>
                  <p>Get intelligent recommendations and anomaly detection</p>
                </div>
                <div className="capability-item">
                  <MapPin size={24} />
                  <h3>Branch Intelligence</h3>
                  <p>Analyze and compare branch operations and health scores</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={`messages-container ${showWelcomeScreen ? 'with-welcome' : ''}`}>
          <div className="date-divider">
            <span>Today</span>
          </div>
          
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              timestamp={formatDate(message.timestamp)}
            />
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
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

      <ChatInput
        value={inputValue}
        onChange={handleInputChange}
        onSubmit={handleSendMessage}
      />
    </div>
  );
};

export default BipChat;