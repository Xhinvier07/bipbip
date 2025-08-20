import { useState } from 'react';
import { Search } from 'lucide-react';
import { aiPromptSuggestions, generateAIResponse, getHealthScoreColor } from '../DashboardData';

const AIInsights = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAiPrompt = async (prompt) => {
    setAiQuery(prompt);
    setLoading(true);
    
    try {
      // Get AI response with simulated delay
      setTimeout(async () => {
        const response = await generateAIResponse(prompt);
        setAiResponse(response);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card ai-insights-card">
      <div className="card-header">
        <div className="card-title">
          <Search size={18} />
          <h2>AI Insights</h2>
        </div>
      </div>
      <div className="card-content">
        <div className="ai-prompt-container">
          <div className="ai-input-container">
            <input 
              type="text" 
              className="ai-input" 
              placeholder="Ask about branch performance..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiQuery) {
                  handleAiPrompt(aiQuery);
                }
              }}
            />
            <button 
              className="ai-submit-btn"
              onClick={() => {
                if (aiQuery) handleAiPrompt(aiQuery);
              }}
            >
              <Search size={16} />
            </button>
          </div>
          
          <div className="ai-suggestions">
            {aiPromptSuggestions.map((suggestion, index) => (
              <button 
                key={index} 
                className="suggestion-chip"
                onClick={() => handleAiPrompt(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {loading && (
            <div className="ai-loading">
              <div className="ai-loading-animation">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p>Analyzing data...</p>
            </div>
          )}
          
          {aiResponse && !loading && (
            <div className="ai-response">
              <p className="response-text">{aiResponse.text}</p>
              <div className="response-data">
                {aiResponse.data.map((item, idx) => (
                  <div key={idx} className="response-item">
                    {item.name && <h4>{item.name}</h4>}
                    {item.city && <h4>{item.city}</h4>}
                    
                    {item.score !== undefined && (
                      <div className="response-metric">
                        <span className="metric-label">BHS:</span>
                        <span className="metric-value" style={{ color: getHealthScoreColor(item.score) }}>
                          {item.score}%
                        </span>
                      </div>
                    )}
                    
                    {item.waitTime !== undefined && (
                      <div className="response-metric">
                        <span className="metric-label">Wait Time:</span>
                        <span className="metric-value">{item.waitTime} min</span>
                      </div>
                    )}
                    
                    {item.avgScore !== undefined && (
                      <div className="response-metric">
                        <span className="metric-label">Avg BHS:</span>
                        <span className="metric-value" style={{ color: getHealthScoreColor(item.avgScore) }}>
                          {item.avgScore}%
                        </span>
                      </div>
                    )}
                    
                    {item.branches !== undefined && (
                      <div className="response-metric">
                        <span className="metric-label">Branches:</span>
                        <span className="metric-value">{item.branches}</span>
                      </div>
                    )}
                    
                    {item.insight && (
                      <div className="insight-text">{item.insight}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;