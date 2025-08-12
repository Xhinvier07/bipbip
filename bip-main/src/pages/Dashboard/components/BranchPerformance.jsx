import { TrendingUp, RefreshCcw, BarChart, Clock, Users } from 'lucide-react';
import { branchHealthData, getHealthScoreColor } from '../DashboardData';

const BranchPerformance = () => {
  return (
    <div className="dashboard-card performance-card">
      <div className="card-header">
        <div className="card-title">
          <TrendingUp size={18} />
          <h2>Branch Performance</h2>
        </div>
        <div className="card-actions">
          <button className="card-action-btn">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="branch-performance-list">
          {branchHealthData.map((branch) => (
            <div key={branch.name} className="branch-performance-item">
              <div className="branch-info">
                <h3>{branch.name}</h3>
                <div className="branch-metrics">
                  <div className="branch-metric">
                    <BarChart size={14} />
                    <span>{branch.transactions}</span>
                  </div>
                  <div className="branch-metric">
                    <Clock size={14} />
                    <span>{branch.waitTime} min</span>
                  </div>
                  <div className="branch-metric">
                    <Users size={14} />
                    <span>{branch.utilization}%</span>
                  </div>
                </div>
              </div>
              <div className="branch-score">
                <div 
                  className="score-circle" 
                  style={{ backgroundColor: getHealthScoreColor(branch.score) }}
                >
                  <span>{branch.score}<span className="score-percentage">%</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BranchPerformance;