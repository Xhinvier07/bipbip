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
    <div className="dashboard-card utilization-card">
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
          <>
            <div className="utilization-dashboard">
              <div className="utilization-main-metrics">
                <div className="utilization-gauge-container">
                  <div className="utilization-gauge-enhanced">
                    <svg width="140" height="140" viewBox="0 0 120 120">
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
                      {/* Center white circle for better appearance */}
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="44" 
                        fill="white" 
                      />
                    </svg>
                    <div className="utilization-gauge-content">
                      <div className="utilization-rate">{utilizationData.overall}%</div>
                      <div className="utilization-label">Overall Rate</div>
                      <div className="utilization-trend">
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
                
                <div className="utilization-metrics-grid">
                  <div className="utilization-metric-card active-card">
                    <div className="metric-card-icon">
                      <UserCheck size={20} />
                    </div>
                    <div className="metric-card-content">
                      <div className="metric-card-value">{utilizationData.active}%</div>
                      <div className="metric-card-label">Active</div>
                    </div>
                  </div>
                  
                  <div className="utilization-metric-card idle-card">
                    <div className="metric-card-icon">
                      <Clock size={20} />
                    </div>
                    <div className="metric-card-content">
                      <div className="metric-card-value">{utilizationData.idle}%</div>
                      <div className="metric-card-label">Idle</div>
                    </div>
                  </div>
                  
                  <div className="utilization-metric-card overtime-card">
                    <div className="metric-card-icon">
                      <TimerOff size={20} />
                    </div>
                    <div className="metric-card-content">
                      <div className="metric-card-value">{utilizationData.overtime}%</div>
                      <div className="metric-card-label">Overtime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="branch-utilization-enhanced">
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
              
              <div className="branch-util-list-enhanced">
                {utilizationData.branchDistribution.map((branch, idx) => (
                  <div key={idx} className="branch-util-item-enhanced">
                    <div className="branch-util-rank">{idx + 1}</div>
                    <div className="branch-util-details">
                      <div className="branch-util-name-enhanced" title={branch.name}>
                        {branch.name.length > 24 ? `${branch.name.substring(0, 22)}...` : branch.name}
                      </div>
                      <div className="branch-util-bar-container-enhanced">
                        <div 
                          className="branch-util-bar-enhanced"
                          style={{ 
                            width: `${branch.utilization}%`,
                            backgroundColor: getUtilizationColor(branch.utilization)
                          }}
                        ></div>
                        <span className="branch-util-value-enhanced" 
                          style={{
                            left: `${Math.min(branch.utilization - 2, 94)}%`,
                            color: branch.utilization > 50 ? 'white' : '#333'
                          }}>
                          {branch.utilization}%
                        </span>
                      </div>
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

export default StaffUtilization;