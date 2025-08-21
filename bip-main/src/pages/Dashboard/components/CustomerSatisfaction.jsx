import { useState, useEffect } from 'react';
import { ThumbsUp, RefreshCcw, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { getCustomerSatisfactionData } from '../DashboardData';

const CustomerSatisfaction = () => {
  const [satisfactionData, setSatisfactionData] = useState({
    overall: 0,
    distribution: [],
    topBranches: [],
    trend: 'positive',
    change: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSatisfactionData();

    // Refresh data periodically to simulate real-time updates
    const intervalId = setInterval(loadSatisfactionData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const loadSatisfactionData = async () => {
    setLoading(true);
    try {
      const data = await getCustomerSatisfactionData();
      setSatisfactionData(data);
    } catch (error) {
      console.error('Error loading customer satisfaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSatisfactionData();
  };

  // Get appropriate color for satisfaction level
  const getSatisfactionColor = (score) => {
    if (score >= 85) return '#00BFA6';  // Excellent
    if (score >= 75) return '#8FD14F';  // Good
    if (score >= 65) return '#FEA000';  // Average
    return '#CF3D58';                   // Poor
  };

  return (
    <div className="dashboard-card satisfaction-card">
      <div className="card-header">
        <div className="card-title">
          <ThumbsUp size={18} />
          <h2>Customer Satisfaction Score (CSAT)</h2>
        </div>
        <div className="card-actions">
          <button 
            className={`card-action-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? 'rotating' : ''} />
          </button>
        </div>
      </div>
      <div className="card-content">
        {loading ? (
          <div className="loading-spinner">
            <RefreshCcw size={24} className="rotating" />
          </div>
        ) : (
          <>
            <div className="satisfaction-summary-enhanced">
              <div className="satisfaction-gauge-enhanced">
                <svg viewBox="0 0 120 120" width="150" height="150">
                  {/* Background circle */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke="#e9ecef" 
                    strokeWidth="10" 
                  />
                  
                  {/* Satisfaction level circle */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke={getSatisfactionColor(satisfactionData.overall)} 
                    strokeWidth="10"
                    strokeDasharray={`${satisfactionData.overall * 3.14}, 314`} 
                    transform="rotate(-90, 60, 60)"
                  />
                  
                  {/* Satisfaction value */}
                  <text 
                    x="60" 
                    y="55" 
                    textAnchor="middle" 
                    fontSize="28" 
                    fontWeight="bold"
                    fill="#333"
                  >
                    {satisfactionData.overall}%
                  </text>
                  
                  {/* Trend indicator */}
                  <text 
                    x="60" 
                    y="75" 
                    textAnchor="middle" 
                    fontSize="14"
                    fill={satisfactionData.trend === 'positive' ? '#10B981' : '#EF4444'}
                  >
                    {satisfactionData.trend === 'positive' ? '▲' : '▼'} {Math.abs(satisfactionData.change)}%
                  </text>
                </svg>
              </div>
              
              <div className="rating-distribution-enhanced">
                {satisfactionData.distribution.map(rating => (
                  <div key={rating.rating} className="rating-row-enhanced">
                    <div className="rating-label-enhanced">
                      {rating.rating} {rating.rating === 1 ? 'Star' : 'Stars'}
                    </div>
                    <div className="rating-bar-container-enhanced">
                      <div 
                        className="rating-bar-enhanced" 
                        style={{ 
                          width: `${rating.percentage}%`,
                          backgroundColor: rating.rating >= 4 ? '#00BFA6' : 
                                          rating.rating >= 3 ? '#FEA000' : '#CF3D58'
                        }}
                      ></div>
                    </div>
                    <div className="rating-percentage-enhanced">{rating.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="top-branches-satisfaction-enhanced">
              <h3>Top Performing Branches (CSAT)</h3>
              <div className="branch-satisfaction-list-enhanced">
                {satisfactionData.topBranches.map((branch, idx) => (
                  <div key={idx} className="branch-satisfaction-item-enhanced">
                    <div className="branch-position" style={{ backgroundColor: getMedalColor(idx) }}>
                      {idx + 1}
                    </div>
                    <div className="branch-sat-details">
                      <div className="branch-sat-name" title={branch.name}>
                        {branch.name.length > 25 ? `${branch.name.substring(0, 23)}...` : branch.name}
                      </div>
                      <div className="branch-sat-bar-container">
                        <div 
                          className="branch-sat-bar"
                          style={{ 
                            width: `${branch.score}%`,
                            backgroundColor: getSatisfactionColor(branch.score)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="branch-sat-score">
                      {branch.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Function to get medal color based on position
const getMedalColor = (position) => {
  switch(position) {
    case 0: return '#FFD700'; // Gold
    case 1: return '#C0C0C0'; // Silver
    case 2: return '#CD7F32'; // Bronze
    default: return '#e9ecef'; // Gray for others
  }
};

export default CustomerSatisfaction;