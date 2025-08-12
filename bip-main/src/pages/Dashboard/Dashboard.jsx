import { useState } from 'react';
import { motion } from 'framer-motion';
import DotGrid from '../../components/DotGrid';
import KPICards from './components/KPICards';
import TransactionChart from './components/TransactionChart';
import CategoryDonut from './components/CategoryDonut';
import BranchPerformance from './components/BranchPerformance';
import AIInsights from './components/AIInsights';
import './Dashboard.css';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  return (
    <div className="dashboard-page">
      {/* Background */}
      <div className="dashboard-background">
        <DotGrid color="#bc7eff" />
      </div>
      
      <div className="dashboard-content">
            <div className="dashboard-header">
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              {/* commented not needed for now 
              <button 
                className="filter-toggle"
                onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              >
              
                <SlidersHorizontal size={16} />
                {isFiltersCollapsed ? <ChevronDown size={14} style={{ marginLeft: '4px' }} /> : <ChevronUp size={14} style={{ marginLeft: '4px' }} />}
              </button>
              */}
            </div>
            <div className={`dashboard-filters ${isFiltersCollapsed ? 'collapsed' : ''}`}>
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
          </div>
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* Main Dashboard Content */}
        <div className="dashboard-grid">
          <TransactionChart />
          <CategoryDonut />
          <BranchPerformance />
          <AIInsights />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;