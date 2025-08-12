import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, BarChart2, Users, Calendar, Activity } from 'lucide-react';

const BranchDetails = ({ branch }) => {
  // Generate random score between 85-100 for demo purposes
  const branchHealthScore = Math.floor(Math.random() * 16) + 85;
  // Health score color depends on the score
  const scoreColor = branchHealthScore >= 95 ? '#00BFA6' : branchHealthScore >= 90 ? '#FEA000' : '#CF3D58';
  
  // Check if branch is currently selected
  if (!branch) return null;

  return (
    <div className="branch-details">
      <div className="branch-header">
        <h2 className="branch-name">{branch.branch_name}</h2>
        <div className="branch-score">
          <span>{branchHealthScore}%</span>
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
            <span>9:00 AM - 3:00 PM</span>
          </div>
        </div>
      </div>
      
      <div className="branch-view-toggle">
        <div className="toggle-container">
          <button className="view-toggle-btn active">Actual</button>
          <button className="view-toggle-btn">Simulated</button>
        </div>
      </div>
      
      <div className="branch-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <Calendar size={18} />
          </div>
          <div className="metric-content">
            <h4>Daily TXN</h4>
            <div className="metric-value">{Math.floor(Math.random() * 300) + 100}</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Clock size={18} />
          </div>
          <div className="metric-content">
            <h4>Avg. WT</h4>
            <div className="metric-value">{Math.floor(Math.random() * 15) + 5} min</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Users size={18} />
          </div>
          <div className="metric-content">
            <h4>Staff utilz.</h4>
            <div className="metric-value">{Math.floor(Math.random() * 30) + 70}%</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Activity size={18} />
          </div>
          <div className="metric-content">
            <h4>Health Status</h4>
            <div className="metric-value">{branchHealthScore}%</div>
          </div>
          <div className="metric-indicator" style={{ backgroundColor: scoreColor }}></div>
        </div>
      </div>
      
      <div className="branch-actions">
        <motion.button 
          className="action-btn simulate-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <BarChart2 size={18} />
          Simulate
        </motion.button>
        
        <motion.button 
          className="action-btn floor-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Activity size={18} />
          Floor Simulator
        </motion.button>
      </div>
    </div>
  );
};

export default BranchDetails;