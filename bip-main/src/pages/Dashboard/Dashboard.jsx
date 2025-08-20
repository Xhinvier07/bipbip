import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import KPICards from './components/KPICards';
import TransactionChart from './components/TransactionChart';
import CategoryDonut from './components/CategoryDonut';
import BranchPerformance from './components/BranchPerformance';
import CustomerChurn from './components/CustomerChurn';
import StaffUtilization from './components/StaffUtilization';
import CustomerSatisfaction from './components/CustomerSatisfaction';
import EnhancedFloatingAIChat from './components/EnhancedFloatingAIChat';
import './Dashboard.css';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to keep dashboard feeling "live"
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };
  
  const toggleFilters = () => {
    setIsFiltersCollapsed(!isFiltersCollapsed);
  };

  return (
    <div className="dashboard-page">      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-date-time">
            <h2>Dashboard</h2>
            <div className="current-date-time">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="dashboard-actions">
            <button 
              className="filter-toggle"
              onClick={toggleFilters}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {isFiltersCollapsed ? 
                <ChevronDown size={14} /> : 
                <ChevronUp size={14} />
              }
            </button>
          </div>
        </div>
        
        <motion.div 
          className={`dashboard-filters ${isFiltersCollapsed ? 'collapsed' : ''}`}
          initial={false}
          animate={{ 
            height: isFiltersCollapsed ? 0 : 'auto',
            opacity: isFiltersCollapsed ? 0 : 1,
            marginBottom: isFiltersCollapsed ? 0 : '20px'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="time-filter">
            <span>Time Period:</span>
            <div className="filter-buttons">
              <button 
                className={timeFilter === 'daily' ? 'active' : ''}
                onClick={() => handleTimeFilterChange('daily')}
              >
                Daily
              </button>
              <button 
                className={timeFilter === 'weekly' ? 'active' : ''}
                onClick={() => handleTimeFilterChange('weekly')}
              >
                Weekly
              </button>
              <button 
                className={timeFilter === 'monthly' ? 'active' : ''}
                onClick={() => handleTimeFilterChange('monthly')}
              >
                Monthly
              </button>
              <button 
                className={timeFilter === 'yearly' ? 'active' : ''}
                onClick={() => handleTimeFilterChange('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="branch-filter">
            <button className="branch-filter-btn">
              <Filter size={16} />
              <span>Filter Branches</span>
            </button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <KPICards />

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* First row - 2 columns - Key metrics and performance */}
          <TransactionChart />
          <BranchPerformance />
          
          {/* Second row - 2 columns - Staff utilization and categories */}
          <StaffUtilization />
          <CategoryDonut />
          
          {/* Third row - 2 columns - Customer metrics */}
          <CustomerChurn />
          <CustomerSatisfaction />
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <EnhancedFloatingAIChat />
    </div>
  );
};

export default Dashboard;