import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCcw, ArrowUpRight, Building2, Clock, Activity } from 'lucide-react';
import { getBranchPerformanceData, getHealthScoreColor } from '../DashboardData';

const BranchPerformance = () => {
  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranchData();

    // Refresh data periodically
    const intervalId = setInterval(loadBranchData, 75000);
    return () => clearInterval(intervalId);
  }, []);

  const loadBranchData = async () => {
    setLoading(true);
    try {
      const data = await getBranchPerformanceData();
      setBranchData(data);
    } catch (error) {
      console.error('Error loading branch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBranchData();
  };

  return (
    <div className="dashboard-card performance-card">
      <div className="card-header">
        <div className="card-title">
          <TrendingUp size={18} />
          <h2>Branch Performance</h2>
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
          <div className="enhanced-branch-list">
            <div className="branch-metrics-header">
              <div className="metric-header">
                <Building2 size={16} />
                <span>Branch</span>
              </div>
              <div className="metric-header">
                <Activity size={16} />
                <span>TXN Count</span>
              </div>
              <div className="metric-header">
                <Clock size={16} />
                <span>Avg. WT</span>
              </div>
              <div className="metric-header">
                <TrendingUp size={16} />
                <span>BHS</span>
              </div>
            </div>
            
            <div className="branch-items-container">
              {branchData.map((branch) => (
                <div key={branch.name} className="enhanced-branch-item">
                  <div className="branch-item-name" title={branch.name}>
                    {branch.name.length > 20 ? `${branch.name.substring(0, 18)}...` : branch.name}
                  </div>
                  <div className="branch-item-txn" title={`${branch.transactions} transactions`}>
                    {branch.transactions.toLocaleString()}
                  </div>
                  <div className="branch-item-wait" title={`${branch.waitTime} min average wait time`}>
                    <div className="wait-time-badge">{branch.waitTime}</div>
                  </div>
                  <div className="branch-item-bhs">
                    <div 
                      className="bhs-indicator" 
                      style={{ backgroundColor: getHealthScoreColor(branch.score) }}
                      title={`Branch Health Score: ${branch.score}%`}
                    >
                      {branch.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="view-all-branches">
              <button className="view-all-btn">
                <span>View All Branches</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchPerformance;