import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  Calendar, 
  BarChart 
} from 'lucide-react';

const BranchDetails = ({ branch }) => {
  // Mock data for branch details
  const branchDetails = {
    phone: "+63 2 8891 0000",
    email: `${branch.branch_name.toLowerCase().replace(/\s+/g, '.')}@bipbip.com`,
    manager: "John Smith",
    openHours: "8:00 AM - 5:00 PM",
    openDays: "Monday - Friday",
    performance: {
      score: 87,
      revenue: "₱3.2M",
      growth: "+12%",
      customers: "1,240"
    }
  };

  return (
    <div className="branch-details">
      <h2>{branch.branch_name}</h2>
      
      <div className="branch-details-info">
        <div className="branch-detail-item">
          <div className="detail-label">
            <MapPin size={14} style={{ marginRight: '5px' }} />
            Address
          </div>
          <div className="detail-value">{branch.address}</div>
        </div>
        
        <div className="branch-detail-item">
          <div className="detail-label">
            <Phone size={14} style={{ marginRight: '5px' }} />
            Contact Number
          </div>
          <div className="detail-value">{branchDetails.phone}</div>
        </div>
        
        <div className="branch-detail-item">
          <div className="detail-label">
            <Mail size={14} style={{ marginRight: '5px' }} />
            Email
          </div>
          <div className="detail-value">{branchDetails.email}</div>
        </div>
        
        <div className="branch-detail-item">
          <div className="detail-label">
            <User size={14} style={{ marginRight: '5px' }} />
            Branch Manager
          </div>
          <div className="detail-value">{branchDetails.manager}</div>
        </div>
        
        <div className="branch-detail-item">
          <div className="detail-label">
            <Clock size={14} style={{ marginRight: '5px' }} />
            Operating Hours
          </div>
          <div className="detail-value">{branchDetails.openHours}</div>
        </div>
        
        <div className="branch-detail-item">
          <div className="detail-label">
            <Calendar size={14} style={{ marginRight: '5px' }} />
            Open Days
          </div>
          <div className="detail-value">{branchDetails.openDays}</div>
        </div>
      </div>
      
      <div className="branch-performance">
        <h3>Branch Performance</h3>
        
        <div className="performance-score">
          <div className="score-circle">
            <div className="score-value">{branchDetails.performance.score}</div>
          </div>
          <div className="score-label">Performance Score</div>
        </div>
        
        <div className="performance-metrics">
          <div className="metric">
            <div className="metric-label">Revenue</div>
            <div className="metric-value">{branchDetails.performance.revenue}</div>
          </div>
          
          <div className="metric">
            <div className="metric-label">Growth</div>
            <div className="metric-value">{branchDetails.performance.growth}</div>
          </div>
          
          <div className="metric">
            <div className="metric-label">Customers</div>
            <div className="metric-value">{branchDetails.performance.customers}</div>
          </div>
        </div>
      </div>
      
      <div className="branch-actions">
        <button className="action-button">View Reports</button>
        <button className="action-button primary">Branch Analysis</button>
      </div>
    </div>
  );
};

export default BranchDetails;