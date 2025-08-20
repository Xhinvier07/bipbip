import { useState, useEffect } from 'react';
import { Users, RefreshCcw, ArrowUp, ArrowDown, UserCheck, Clock, TimerOff } from 'lucide-react';
import { getStaffUtilizationData } from '../DashboardData';
import '../staff-utilization.css';

const StaffUtilization = () => {
  const [utilizationData, setUtilizationData] = useState({
    overall: 0,
    active: 0,
    idle: 0,
    overtime: 0,
    branchDistribution: [],
    trend: 'positive',
    change: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUtilizationData();

    // Refresh data periodically to simulate real-time updates
    const intervalId = setInterval(loadUtilizationData, 70000);
    return () => clearInterval(intervalId);
  }, []);

  const loadUtilizationData = async () => {
    setLoading(true);
    try {
      const data = await getStaffUtilizationData();
      setUtilizationData(data);
    } catch (error) {
      console.error('Error loading staff utilization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUtilizationData();
  };

  // Get color based on utilization percentage
  const getUtilizationColor = (value) => {
    if (value >= 85) return '#00BFA6';  // Good utilization
    if (value >= 70) return '#FEA000';  // Moderate utilization
    return '#CF3D58';  // Poor utilization
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-title">
          <Users size={18} />
          <h2>Staff Utilization</h2>
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
          <div className="staff-utilization-container">
            {/* First row - Overall rate and metrics */}
            <div className="staff-util-row">
              {/* Overall rate gauge */}
              <div className="overall-rate-container">
                <div className="gauge-wrapper">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {/* Background track */}
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="54" 
                      fill="none" 
                      stroke="#e9ecef" 
                      strokeWidth="10" 
                    />
                    {/* Colored progress */}
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="54" 
                      fill="none" 
                      stroke={getUtilizationColor(utilizationData.overall)} 
                      strokeWidth="10" 
                      strokeDasharray={`${utilizationData.overall * 3.4} 340`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                    {/* Center white circle */}
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="44" 
                      fill="white" 
                    />
                  </svg>
                  <div className="gauge-content">
                    <div className="rate-value">{utilizationData.overall}%</div>
                    <div className="rate-label">Overall Rate</div>
                    <div className="rate-trend">
                      {utilizationData.trend === 'positive' ? (
                        <span className="positive">
                          <ArrowUp size={14} /> {Math.abs(utilizationData.change)}%
                        </span>
                      ) : (
                        <span className="negative">
                          <ArrowDown size={14} /> {Math.abs(utilizationData.change)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Metrics grid */}
              <div className="utilization-metrics">
                <div className="metric-item active">
                  <div className="metric-icon">
                    <UserCheck size={18} />
                  </div>
                  <div className="metric-details">
                    <div className="metric-value">{utilizationData.active}%</div>
                    <div className="metric-label">Active</div>
                  </div>
                </div>
                
                <div className="metric-item idle">
                  <div className="metric-icon">
                    <Clock size={18} />
                  </div>
                  <div className="metric-details">
                    <div className="metric-value">{utilizationData.idle}%</div>
                    <div className="metric-label">Idle</div>
                  </div>
                </div>
                
                <div className="metric-item overtime">
                  <div className="metric-icon">
                    <TimerOff size={18} />
                  </div>
                  <div className="metric-details">
                    <div className="metric-value">{utilizationData.overtime}%</div>
                    <div className="metric-label">Overtime</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second row - Top Branch Utilization */}
            <div className="staff-util-row branch-util-section">
              <div className="branch-util-header">
                <h3>Top Branch Utilization</h3>
                <div className="branch-util-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#10B981'}}></div>
                    <span>Good</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#FEA000'}}></div>
                    <span>Average</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#CF3D58'}}></div>
                    <span>Low</span>
                  </div>
                </div>
              </div>
              
              <div className="branch-util-list">
                {utilizationData.branchDistribution.slice(0, 10).map((branch, idx) => (
                  <div key={idx} className="branch-util-item">
                    <div className="branch-rank">{idx + 1}</div>
                    <div className="branch-details">
                      <div className="branch-name" title={branch.name}>
                        {branch.name.length > 24 ? `${branch.name.substring(0, 22)}...` : branch.name}
                      </div>
                      <div className="branch-bar-wrapper">
                        <div 
                          className="branch-bar"
                          style={{ 
                            width: `${branch.utilization}%`,
                            backgroundColor: getUtilizationColor(branch.utilization)
                          }}
                        ></div>
                        <span className="branch-value">{branch.utilization}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffUtilization;
