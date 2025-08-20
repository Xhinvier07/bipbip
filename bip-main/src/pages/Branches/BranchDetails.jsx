import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, BarChart2, Users, Calendar, Activity, Settings, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BranchDetails = ({ branch }) => {
  const navigate = useNavigate();
  // Use branch health score from data or generate one as fallback
  const branchHealthScore = branch.bhs ? Math.round(branch.bhs) : Math.floor(Math.random() * 71) + 30;
  // Health score color based on the new requirements
  // <45 is red, >50 orange, >85 is green
  const scoreColor = branchHealthScore > 85 ? '#00BFA6' : branchHealthScore > 50 ? '#FEA000' : '#CF3D58';
  
  // State for view toggle between Actual and Simulated
  const [activeView, setActiveView] = useState('actual');
  // State to track if simulation is running
  const [isSimulating, setIsSimulating] = useState(false);
  // Current time in simulation (9-17 represents 9am-5pm)
  const [currentTime, setCurrentTime] = useState(9);
  // Timer reference for simulation
  const [simulationTimer, setSimulationTimer] = useState(null);
  
  // State for simulation parameters
  const [simulationParams, setSimulationParams] = useState({
    staffCount: 4,
    customerRate: Math.floor(Math.random() * 20) + 10,
    avgServiceTime: Math.floor(Math.random() * 5) + 3,
    peakHour: false,
    trafficPattern: 'normal', // 'normal', 'morning-peak', 'lunch-peak', 'afternoon-peak'
    staffEfficiency: 80 // percentage
  });
  
  // Get time-based multipliers based on current time and traffic pattern
  const getTimeMultipliers = () => {
    // Default multipliers
    let customerMultiplier = 1.0;
    let waitTimeMultiplier = 1.0;
    
    // Time-based adjustments (9am-5pm)
    switch(simulationParams.trafficPattern) {
      case 'morning-peak':
        // Higher traffic in morning (9-11)
        if (currentTime >= 9 && currentTime <= 11) {
          customerMultiplier = 1.5;
          waitTimeMultiplier = 1.3;
        }
        break;
      case 'lunch-peak':
        // Higher traffic during lunch (12-2)
        if (currentTime >= 12 && currentTime <= 14) {
          customerMultiplier = 1.6;
          waitTimeMultiplier = 1.4;
        }
        break;
      case 'afternoon-peak':
        // Higher traffic in afternoon (2-4)
        if (currentTime >= 14 && currentTime <= 16) {
          customerMultiplier = 1.4;
          waitTimeMultiplier = 1.2;
        }
        break;
      default: // 'normal'
        // Slight increase during lunch time
        if (currentTime >= 12 && currentTime <= 13) {
          customerMultiplier = 1.2;
          waitTimeMultiplier = 1.1;
        }
    }
    
    return { customerMultiplier, waitTimeMultiplier };
  };
  
  // Base metrics adjusted with actual branch data to make simulation more realistic
  const baseTransactions = branch.daily_transactions || Math.floor(Math.random() * 300) + 100;
  const baseWaitTime = branch.avg_waiting_time || Math.floor(Math.random() * 15) + 5;
  const baseUtilization = branch.staff_utilization || Math.floor(Math.random() * 30) + 70;
  const baseHealthScore = branch.bhs || Math.floor(Math.random() * 71) + 30;
  
  // Get time-specific multipliers
  const { customerMultiplier, waitTimeMultiplier } = getTimeMultipliers();
  
  // Simulated metrics with time-based factors
  const simulatedMetrics = {
    dailyTxn: Math.round(simulationParams.customerRate * 8 * customerMultiplier),
    avgWaitTime: Math.round(Math.max(2, baseWaitTime * waitTimeMultiplier * (10/simulationParams.staffCount) * (simulationParams.avgServiceTime/5) * (100/simulationParams.staffEfficiency))),
    staffUtilization: Math.min(100, Math.round(baseUtilization * customerMultiplier * (simulationParams.customerRate/10) * (100/simulationParams.staffCount))),
    healthScore: Math.min(100, Math.round(baseHealthScore - (simulationParams.avgServiceTime - simulationParams.staffCount) * 5 - (currentTime >= 12 && currentTime <= 14 ? 10 : 0) + (simulationParams.staffEfficiency - 80) / 2))
  };
  
  // Handler for simulation parameter changes
  const handleParamChange = (param, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  // Start simulation - progresses from 9am to 5pm
  const startSimulation = () => {
    // If already simulating, stop first
    if (isSimulating) {
      stopSimulation();
      return;
    }
    
    // Set to simulation view
    setActiveView('simulated');
    setIsSimulating(true);
    // Reset to 9am
    setCurrentTime(9);
    
    // Create timer that advances time every 2 seconds
    const timer = setInterval(() => {
      setCurrentTime(prevTime => {
        // If we reached 5pm (17), stop simulation
        if (prevTime >= 17) {
          stopSimulation();
          return 17;
        }
        // Advance time by 1 hour
        return prevTime + 1;
      });
    }, 2000);
    
    setSimulationTimer(timer);
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (simulationTimer) {
      clearInterval(simulationTimer);
      setSimulationTimer(null);
    }
    setIsSimulating(false);
  };
  
  // Check if branch is currently selected
  if (!branch) return null;

  return (
    <div className="branch-details">
      <div className="branch-header">
        <h2 className="branch-name">{branch.branch_name}</h2>
        <div className="branch-score">
          <span style={{ color: scoreColor }}>{activeView === 'actual' ? branchHealthScore : Math.round(simulatedMetrics.healthScore)}%</span>
          <span className="score-label">BHS</span>
        </div>
      </div>
      
      <div className="branch-info-section">
        <div className="branch-address-container">
          <MapPin size={18} className="branch-info-icon" />
          <p>{branch.address}</p>
        </div>
        
        <div className="branch-contact">
          <div className="branch-contact-item">
            <Phone size={16} className="branch-info-icon" />
            <span>(02) 8891-0000</span>
          </div>
          <div className="branch-contact-item">
            <Mail size={16} className="branch-info-icon" />
            <span>{branch.branch_name.toLowerCase().replace(/\s+/g, '.')}@bpi.com.ph</span>
          </div>
          <div className="branch-contact-item">
            <Clock size={16} className="branch-info-icon" />
            <span>9:00 AM - 5:00 PM</span>
          </div>
        </div>
      </div>
      
      <div className="branch-view-toggle">
        <div className="toggle-container">
          <button 
            className={`view-toggle-btn ${activeView === 'actual' ? 'active' : ''}`}
            onClick={() => setActiveView('actual')}
          >
            Actual
          </button>
          <button 
            className={`view-toggle-btn ${activeView === 'simulated' ? 'active' : ''}`}
            onClick={() => setActiveView('simulated')}
          >
            Simulated
          </button>
        </div>
      </div>
      
      {activeView === 'simulated' && (
        <div className="simulation-params">
          <h4 className="params-title">
            <Settings size={14} /> Simulation Parameters
            {isSimulating && <span className="simulation-time">Current Time: {currentTime < 12 ? `${currentTime}:00 AM` : currentTime === 12 ? `12:00 PM` : `${currentTime-12}:00 PM`}</span>}
          </h4>
          
          <div className="param-row">
            <label>Staff Count</label>
            <div className="param-control">
              <button 
                className="param-btn"
                onClick={() => handleParamChange('staffCount', Math.max(1, simulationParams.staffCount - 1))}
                disabled={isSimulating || simulationParams.staffCount <= 1}
              >-</button>
              <span>{simulationParams.staffCount}</span>
              <button 
                className="param-btn"
                onClick={() => handleParamChange('staffCount', Math.min(10, simulationParams.staffCount + 1))}
                disabled={isSimulating || simulationParams.staffCount >= 10}
              >+</button>
            </div>
          </div>
          
          <div className="param-row">
            <label>Customer Rate (per hour)</label>
            <div className="param-control">
              <button 
                className="param-btn"
                onClick={() => handleParamChange('customerRate', Math.max(5, simulationParams.customerRate - 5))}
                disabled={isSimulating || simulationParams.customerRate <= 5}
              >-</button>
              <span>{simulationParams.customerRate}</span>
              <button 
                className="param-btn"
                onClick={() => handleParamChange('customerRate', Math.min(50, simulationParams.customerRate + 5))}
                disabled={isSimulating || simulationParams.customerRate >= 50}
              >+</button>
            </div>
          </div>
          
          <div className="param-row">
            <label>Avg. Service Time (min)</label>
            <div className="param-control">
              <button 
                className="param-btn"
                onClick={() => handleParamChange('avgServiceTime', Math.max(1, simulationParams.avgServiceTime - 1))}
                disabled={isSimulating || simulationParams.avgServiceTime <= 1}
              >-</button>
              <span>{simulationParams.avgServiceTime}</span>
              <button 
                className="param-btn"
                onClick={() => handleParamChange('avgServiceTime', Math.min(15, simulationParams.avgServiceTime + 1))}
                disabled={isSimulating || simulationParams.avgServiceTime >= 15}
              >+</button>
            </div>
          </div>
          
          <div className="param-row">
            <label>Staff Efficiency (%)</label>
            <div className="param-control">
              <button 
                className="param-btn"
                onClick={() => handleParamChange('staffEfficiency', Math.max(50, simulationParams.staffEfficiency - 5))}
                disabled={isSimulating || simulationParams.staffEfficiency <= 50}
              >-</button>
              <span>{simulationParams.staffEfficiency}</span>
              <button 
                className="param-btn"
                onClick={() => handleParamChange('staffEfficiency', Math.min(100, simulationParams.staffEfficiency + 5))}
                disabled={isSimulating || simulationParams.staffEfficiency >= 100}
              >+</button>
            </div>
          </div>
          
          <div className="param-row">
            <label>Traffic Pattern</label>
            <select 
              value={simulationParams.trafficPattern}
              onChange={(e) => handleParamChange('trafficPattern', e.target.value)}
              disabled={isSimulating}
              className="traffic-pattern-select"
            >
              <option value="normal">Normal</option>
              <option value="morning-peak">Morning Peak</option>
              <option value="lunch-peak">Lunch Peak</option>
              <option value="afternoon-peak">Afternoon Peak</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="branch-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <Calendar size={18} />
          </div>
          <div className="metric-content">
            <h4>Daily TXN</h4>
            <div className="metric-value">
              {activeView === 'actual' 
                ? (branch.daily_transactions || Math.floor(Math.random() * 300) + 100)
                : simulatedMetrics.dailyTxn}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={18} />
          </div>
          <div className="metric-content">
            <h4>Avg. WT</h4>
            <div className="metric-value">
              {activeView === 'actual'
                ? `${branch.avg_waiting_time ? Math.round(branch.avg_waiting_time) : Math.floor(Math.random() * 15) + 5} min`
                : `${Math.round(simulatedMetrics.avgWaitTime)} min`}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Users size={18} />
          </div>
          <div className="metric-content">
            <h4>Staff utilz.</h4>
            <div className="metric-value">
              {activeView === 'actual' 
                ? `${branch.staff_utilization || Math.floor(Math.random() * 30) + 70}%`
                : `${Math.round(simulatedMetrics.staffUtilization)}%`}
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Activity size={18} />
          </div>
          <div className="metric-content">
            <h4>Health Status</h4>
            <div className="metric-value">
              {activeView === 'actual'
                ? `${Math.round(branchHealthScore)}%`
                : `${Math.round(simulatedMetrics.healthScore)}%`}
            </div>
          </div>
          <div className="metric-indicator" 
            style={{ 
              backgroundColor: activeView === 'actual' 
                ? scoreColor 
                : simulatedMetrics.healthScore > 85 
                  ? '#00BFA6' 
                  : simulatedMetrics.healthScore > 50 
                    ? '#FEA000' 
                    : '#CF3D58' 
            }}>
          </div>
        </div>
      </div>
      
      <div className="branch-actions">
        <motion.button 
          className={`action-btn simulate-btn ${isSimulating ? 'stop' : ''}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={startSimulation}
        >
          <BarChart2 size={18} />
          {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        </motion.button>
        
        <motion.button 
          className="action-btn floor-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/simulation', { state: { branchName: branch.branch_name }})}
        >
          <Activity size={18} />
          Floor Simulator
        </motion.button>
      </div>
    </div>
  );
};

export default BranchDetails;