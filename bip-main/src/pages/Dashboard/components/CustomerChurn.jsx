import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Clock, ThumbsDown, ShoppingBag } from 'lucide-react';
import { getChurnPredictionData } from '../DashboardData';

const CustomerChurn = () => {
  const [churnData, setChurnData] = useState({
    overallChurnRisk: 0,
    atRiskBranches: [],
    totalAtRisk: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChurnData();

    // Refresh data periodically to simulate real-time updates
    const intervalId = setInterval(loadChurnData, 80000);
    return () => clearInterval(intervalId);
  }, []);

  const loadChurnData = async () => {
    setLoading(true);
    try {
      const data = await getChurnPredictionData();
      setChurnData(data);
    } catch (error) {
      console.error('Error loading churn prediction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadChurnData();
  };
  
  // Get appropriate color for risk level
  const getRiskColor = (score) => {
    if (score >= 40) return '#CF3D58';
    if (score >= 30) return '#FEA000';
    return '#10B981';
  };

  return (
    <div className="dashboard-card churn-card">
      <div className="card-header">
        <div className="card-title">
          <AlertTriangle size={18} />
          <h2>Customer Churn Prediction</h2>
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
            <div className="churn-summary-improved">
              <div className="churn-risk-meter">
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
                  
                  {/* Risk level arc */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke={getRiskColor(churnData.overallChurnRisk)} 
                    strokeWidth="10"
                    strokeDasharray={`${churnData.overallChurnRisk * 3.14}, 314`} 
                    transform="rotate(-90, 60, 60)"
                  />
                  
                  {/* Risk value */}
                  <text 
                    x="60" 
                    y="55" 
                    textAnchor="middle" 
                    fontSize="28" 
                    fontWeight="bold"
                    fill="#333"
                  >
                    {churnData.overallChurnRisk}%
                  </text>
                  
                  {/* Risk label */}
                  <text 
                    x="60" 
                    y="75" 
                    textAnchor="middle" 
                    fontSize="14"
                    fill="#777"
                  >
                    Churn Risk
                  </text>
                </svg>
              </div>
              
              <div className="churn-risk-info">
                <div className="risk-stat">
                  <div className="risk-stat-label">At-Risk Branches</div>
                  <div className="risk-stat-value">{churnData.totalAtRisk}</div>
                </div>
                <div className="risk-warning">
                  <AlertTriangle size={18} />
                  <span>These branches show signs of potential customer churn based on lower satisfaction scores, increased wait times, and decreased transaction volumes.</span>
                </div>
              </div>
            </div>
            
            {churnData.atRiskBranches.length > 0 && (
              <div className="churn-branch-list">
                {churnData.atRiskBranches.map((branch, idx) => (
                  <div key={idx} className="churn-branch-item">
                    <div className="churn-branch-header">
                      <div className="churn-branch-name">{branch.name}</div>
                      <div 
                        className="churn-branch-risk" 
                        style={{ backgroundColor: getRiskColor(branch.riskScore) }}
                      >
                        {branch.riskScore}% Risk
                      </div>
                    </div>
                    <div className="churn-branch-city">{branch.city}</div>
                    <div className="churn-factors">
                      {branch.factors.waitTime && (
                        <div className="churn-factor">
                          <Clock size={14} />
                          <span>High Wait Time</span>
                        </div>
                      )}
                      {branch.factors.sentiment && (
                        <div className="churn-factor">
                          <ThumbsDown size={14} />
                          <span>Low Satisfaction</span>
                        </div>
                      )}
                      {branch.factors.transactions && (
                        <div className="churn-factor">
                          <ShoppingBag size={14} />
                          <span>Low Transactions</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerChurn;